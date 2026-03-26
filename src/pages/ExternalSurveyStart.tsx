import { useState, useEffect } from 'react';
import { PlayfulButton, PlayfulCard } from '@/components/ui/playful';
import { useSearchParams } from 'react-router-dom';

export default function ExternalSurveyStart() {
    const [searchParams] = useSearchParams();
    const [extSurvey, setExtSurvey] = useState<any>(null);
    const [extAnswers, setExtAnswers] = useState<Record<string, string>>({});
    const [extCurrentStep, setExtCurrentStep] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = searchParams.get('token');
        const rid = searchParams.get('rid') || '';
        const transactionId = searchParams.get('transactionId') || '';

        // Persist values for potential recovery
        localStorage.setItem('ext_rid', rid);
        localStorage.setItem('ext_transactionId', transactionId);
        localStorage.setItem('ext_token', token || '');

        if (!token) {
            setLoading(false);
            return;
        }

        const apiUrl = import.meta.env.PROD
            ? 'https://survey-panelgo.onrender.com'
            : 'http://localhost:3000';

        fetch(`${apiUrl}/external/data/${token}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setExtSurvey(data.survey);
                } else {
                    console.error("Survey not found");
                }
            })
            .catch(err => console.error("Error fetching external survey:", err))
            .finally(() => setLoading(false));
    }, [searchParams]);

    const handleExtSubmit = async () => {
        if (!extSurvey) return;

        const rid = searchParams.get('rid') || '';
        const transactionId = searchParams.get('transactionId') || '';
        const token = searchParams.get('token') || '';

        const apiUrl = import.meta.env.PROD
            ? 'https://survey-panelgo.onrender.com'
            : 'http://localhost:3000';

        // 1. PRESCREENER VALIDATION
        let passed = true;
        (extSurvey.questions || []).forEach((q: any, i: number) => {
            if ((extAnswers[`q_${i}`] || '').trim().toLowerCase() !== (q.correctAnswer || '').trim().toLowerCase()) {
                passed = false;
            }
        });

        if (!passed) {
            console.log("❌ External Prescreener Failed");

            // 👉 Step 1: Punch data internally as TERMINATE
            try {
                await fetch(`${apiUrl}/api/external/punch`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        transactionId,
                        userId: rid,
                        projectId: extSurvey.projectId,
                        vendorId: extSurvey.vendor?.id || extSurvey.vendor?._id,
                        status: 'terminate',
                        token
                    })
                });
                console.log("✅ Internal Fail Punch Successful");
            } catch (err) {
                console.error("Internal Punch Failed:", err);
            }

            // 👉 Step 2: Redirect user to Vendor Terminate URL
            const terminateBase = extSurvey.vendor?.terminate_url || "/survey-result/terminated";
            const sep = terminateBase.includes("?") ? "&" : "?";
            window.location.href = `${terminateBase}${sep}rid=${rid}&transactionId=${transactionId}&status=2`;
            return;
        }

        // 2. PASS → SUCCESS
        console.log("✅ External Prescreener Passed");

        // Replace placeholders in External Survey URL
        // [#transaction_id#] → transactionId
        // [#userid#] → rid
        let finalUrl = extSurvey.externalUrl || "";
        finalUrl = finalUrl.replace(/\[#transaction_id#\]/g, transactionId);
        finalUrl = finalUrl.replace(/\[#userid#\]/g, rid);

        // If no placeholders, append as query params if needed (common practice)
        // But requirement specifically says "Replace"

        // Add return URLs to external survey if it supports it (via common formats)
        // However, the rule says "only extend", so we follow the specific replacement rule.

        console.log("🚀 Redirecting to External Survey:", finalUrl);
        window.location.href = finalUrl;
    };

    if (loading) return <div className="min-h-screen bg-violet-50 flex items-center justify-center font-jakarta font-bold text-violet">Loading Prescreener...</div>;

    if (!extSurvey) return (
        <div className="min-h-screen bg-violet-50 flex items-center justify-center p-4">
            <PlayfulCard className="p-8 text-center bg-white shadow-xl max-w-md w-full">
                <h2 className="text-2xl font-bold text-navy mb-4">Survey Not Found</h2>
                <p className="text-gray-600 mb-6">The survey link you followed may have expired or is incorrect.</p>
                <PlayfulButton variant="primary" onClick={() => window.location.href = '/'}>Back to Home</PlayfulButton>
            </PlayfulCard>
        </div>
    );

    const currentQuestion = extSurvey.questions[extCurrentStep];

    return (
        <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-pink-50 flex items-center justify-center p-4">
            <PlayfulCard className="max-w-2xl w-full p-8 md:p-12 shadow-2xl">
                <div className="mb-8 text-center md:text-left">
                    <h2 className="text-3xl font-jakarta font-bold text-navy mb-2">{extSurvey.title}</h2>
                    <div className="h-1 w-20 bg-gradient-to-r from-violet to-pink rounded-full mb-6 mx-auto md:mx-0"></div>
                    <p className="text-gray-500 font-medium">Question {extCurrentStep + 1} of {extSurvey.questions.length}</p>
                </div>

                <div className="mb-10">
                    <div className="bg-violet/5 p-6 rounded-2xl mb-6">
                        <h3 className="text-xl font-bold text-gray-800">{currentQuestion.text}</h3>
                    </div>
                    <input
                        type="text"
                        placeholder="Your answer..."
                        value={extAnswers[`q_${extCurrentStep}`] || ''}
                        onChange={(e) => setExtAnswers({ ...extAnswers, [`q_${extCurrentStep}`]: e.target.value })}
                        onKeyPress={(e) => e.key === 'Enter' && (extAnswers[`q_${extCurrentStep}`] || '').trim() && (extCurrentStep < extSurvey.questions.length - 1 ? setExtCurrentStep(extCurrentStep + 1) : handleExtSubmit())}
                        className="w-full px-6 py-4 text-lg border-2 border-violet/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-violet/10 focus:border-violet transition-all bg-white shadow-sm"
                        autoFocus
                    />
                </div>

                <div className="flex justify-between items-center">
                    {extCurrentStep > 0 && (
                        <button
                            onClick={() => setExtCurrentStep(extCurrentStep - 1)}
                            className="text-gray-500 font-semibold hover:text-violet transition-colors flex items-center"
                        >
                            <span className="mr-2">←</span> Previous
                        </button>
                    )}
                    <div className="ml-auto">
                        {extCurrentStep < extSurvey.questions.length - 1 ? (
                            <PlayfulButton
                                variant="primary"
                                onClick={() => setExtCurrentStep(extCurrentStep + 1)}
                                disabled={!(extAnswers[`q_${extCurrentStep}`] || '').trim()}
                            >
                                Next Question →
                            </PlayfulButton>
                        ) : (
                            <PlayfulButton
                                variant="primary"
                                onClick={handleExtSubmit}
                                disabled={!(extAnswers[`q_${extCurrentStep}`] || '').trim()}
                            >
                                Finish & Start Survey
                            </PlayfulButton>
                        )}
                    </div>
                </div>
            </PlayfulCard>
        </div>
    );
}

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlayfulCard, PlayfulBadge } from '@/components/ui/playful';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Search, 
  Globe, 
  User, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Clock,
  RefreshCw
} from 'lucide-react';
import { getSurveyTrackingLogs } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

interface TrackingLog {
  id: string;
  surveyId: string;
  userId: string;
  clickId: string;
  ipAddress: string;
  status: 'completed' | 'terminated' | 'quota_full';
  timestamp: string;
}

export default function SurveyLogs() {
  const { token } = useAuth();
  const [logs, setLogs] = useState<TrackingLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<TrackingLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLogs = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const response = await getSurveyTrackingLogs(token);
      setLogs(response.logs as TrackingLog[]);
      setFilteredLogs(response.logs as TrackingLog[]);
    } catch (err) {
      setError('Failed to load survey logs');
      console.error('Error fetching logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [token]);

  useEffect(() => {
    const filtered = logs.filter(log => 
      log.surveyId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.clickId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ipAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredLogs(filtered);
  }, [searchTerm, logs]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'terminated':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'quota_full':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <PlayfulBadge variant="green">Completed</PlayfulBadge>;
      case 'terminated':
        return <PlayfulBadge variant="pink">Terminated</PlayfulBadge>;
      case 'quota_full':
        return <PlayfulBadge variant="yellow">Quota Full</PlayfulBadge>;
      default:
        return <PlayfulBadge variant="violet">Unknown</PlayfulBadge>;
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading && logs.length === 0) {
    return (
      <div className="space-y-6">
        <PlayfulCard className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet mr-3"></div>
            <span className="text-navy-light font-jakarta">Loading survey logs...</span>
          </div>
        </PlayfulCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-outfit font-bold text-3xl text-navy mb-2">Survey Logs</h1>
          <p className="font-jakarta text-navy-light">View all survey tracking records with exact user data</p>
        </div>
        <Button onClick={fetchLogs} variant="outline" size="sm" className="w-full sm:w-auto">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="flex items-center space-x-2 w-full">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-navy-light h-4 w-4" />
          <Input
            placeholder="Search by Survey ID, User ID, PID, IP, or Status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full border-2 border-navy rounded-2xl focus:border-violet"
          />
        </div>
      </div>

      {error ? (
        <PlayfulCard className="p-6 text-center">
          <AlertCircle className="h-12 w-12 text-pink mx-auto mb-4" />
          <h3 className="text-lg font-medium text-navy mb-2">Error</h3>
          <p className="font-jakarta text-navy-light mb-4">{error}</p>
          <Button onClick={fetchLogs}>Try Again</Button>
        </PlayfulCard>
      ) : filteredLogs.length === 0 ? (
        <PlayfulCard className="p-6 text-center">
          <div className="bg-periwinkle/30 rounded-full p-3 w-12 h-12 mx-auto mb-4">
            <Search className="h-6 w-6 text-navy-light" />
          </div>
          <h3 className="text-lg font-medium text-navy mb-2">
            {searchTerm ? 'No matching records found' : 'No survey logs available'}
          </h3>
          <p className="font-jakarta text-navy-light">
            {searchTerm 
              ? 'Try adjusting your search terms'
              : 'Survey tracking records will appear here once users complete surveys'
            }
          </p>
        </PlayfulCard>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="lg:hidden space-y-3">
            {filteredLogs.map((log) => (
              <PlayfulCard key={log.id} className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(log.status)}
                      {getStatusBadge(log.status)}
                    </div>
                    <div className="flex items-center gap-1 text-navy-light">
                      <Clock className="h-3 w-3" />
                      <span className="text-xs font-mono">{formatDate(log.timestamp)}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-jakarta font-medium text-navy-light min-w-[80px]">Survey:</span>
                      <span className="font-mono text-navy break-all">{log.surveyId}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-navy-light shrink-0" />
                      <span className="font-mono text-navy break-all">{log.userId}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-navy-light shrink-0" />
                      <span className="font-mono text-navy break-all">{log.clickId}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-navy-light shrink-0" />
                      <span className="font-mono text-navy">{log.ipAddress}</span>
                    </div>
                  </div>
                </div>
              </PlayfulCard>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <PlayfulCard className="overflow-hidden p-0">
              <div className="overflow-x-auto">
                <Table className="w-auto" style={{ minWidth: '900px' }}>
                  <TableHeader>
                    <TableRow className="bg-periwinkle/30">
                      <TableHead className="font-outfit font-bold text-navy">Survey ID</TableHead>
                      <TableHead className="font-outfit font-bold text-navy">User ID</TableHead>
                      <TableHead className="font-outfit font-bold text-navy">PID (Click ID)</TableHead>
                      <TableHead className="font-outfit font-bold text-navy">IP Address</TableHead>
                      <TableHead className="font-outfit font-bold text-navy">Status</TableHead>
                      <TableHead className="font-outfit font-bold text-navy">Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow key={log.id} className="hover:bg-periwinkle/10">
                        <TableCell className="font-medium">
                          <span className="font-mono text-sm">{log.surveyId}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-navy-light" />
                            <span className="font-mono text-sm">{log.userId}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-navy-light" />
                            <span className="font-mono text-sm">{log.clickId}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Globe className="h-4 w-4 text-navy-light" />
                            <span className="text-sm">{log.ipAddress}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(log.status)}
                            {getStatusBadge(log.status)}
                          </div>
                        </TableCell>
                        <TableCell className="min-w-[180px] max-w-[200px]">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-navy-light flex-shrink-0" />
                            <span className="text-sm font-mono whitespace-nowrap">{formatDate(log.timestamp)}</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </PlayfulCard>
          </div>

          {logs.length > 0 && (
            <div className="text-sm text-navy-light font-jakarta">
              Showing {filteredLogs.length} of {logs.length} records
            </div>
          )}
        </>
      )}
    </div>
  );
}

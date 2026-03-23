import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'terminated':
        return <Badge className="bg-red-100 text-red-800">Terminated</Badge>;
      case 'quota_full':
        return <Badge className="bg-yellow-100 text-yellow-800">Quota Full</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading && logs.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
              <span className="text-gray-600">Loading survey logs...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden">
      <Card className="w-full max-w-full">
        <CardHeader className="w-full max-w-full">
          <div className="flex items-center justify-between flex-wrap gap-4 w-full max-w-full">
            <CardTitle className="text-xl min-w-0 flex-1">Survey Logs</CardTitle>
            <Button onClick={fetchLogs} variant="outline" size="sm" className="flex-shrink-0">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
          <p className="text-gray-600">
            View all survey tracking records with exact user data
          </p>
        </CardHeader>
        <CardContent className="w-full max-w-full">
          <div className="flex items-center space-x-2 mb-6 w-full max-w-full">
            <div className="relative flex-1 w-full max-w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by Survey ID, User ID, PID, IP, or Status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
          </div>

          {error ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={fetchLogs}>Try Again</Button>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-100 rounded-full p-3 w-12 h-12 mx-auto mb-4">
                <Search className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No matching records found' : 'No survey logs available'}
              </h3>
              <p className="text-gray-600">
                {searchTerm 
                  ? 'Try adjusting your search terms'
                  : 'Survey tracking records will appear here once users complete surveys'
                }
              </p>
            </div>
          ) : (
            <div className="w-full overflow-x-auto border rounded-lg">
              <Table className="w-auto" style={{ minWidth: '900px' }}>
                <TableHeader>
                  <TableRow>
                    <TableHead>Survey ID</TableHead>
                    <TableHead>User ID</TableHead>
                    <TableHead>PID (Click ID)</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">
                        {log.surveyId}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{log.userId}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-gray-400" />
                          <span className="font-mono text-sm">{log.clickId}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Globe className="h-4 w-4 text-gray-400" />
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
                          <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <span className="text-sm font-mono whitespace-nowrap">{formatDate(log.timestamp)}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {logs.length > 0 && (
            <div className="mt-4 text-sm text-gray-600">
              Showing {filteredLogs.length} of {logs.length} records
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

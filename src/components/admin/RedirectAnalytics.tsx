import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
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
  RefreshCw,
  Copy,
  Play
} from 'lucide-react';

const BACKEND_URL = "https://survey-panelgo.onrender.com";

const statusMap: Record<string, number> = {
  "Completed": 1,
  "Terminated": 2,
  "Quota Full": 3,
  "Security Terminated": 4
};

interface RedirectLog {
  id: string;
  pid: string;
  uid: string;
  status: number;
  statusText: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

interface RedirectAnalyticsProps {
  className?: string;
}

const statusLabels = {
  1: 'Completed',
  2: 'Terminated',
  3: 'Quota Full',
  4: 'Security Terminated',
};

const statusColors = {
  1: '#10b981', // green
  2: '#ef4444', // red
  3: '#f59e0b', // yellow
  4: '#6b7280', // gray
};

const getStatusIcon = (status: number) => {
  switch (status) {
    case 1: return <CheckCircle className="h-4 w-4 text-green" />;
    case 2: return <XCircle className="h-4 w-4 text-pink" />;
    case 3: return <AlertCircle className="h-4 w-4 text-yellow" />;
    case 4: return <XCircle className="h-4 w-4 text-gray" />;
    default: return <AlertCircle className="h-4 w-4 text-navy-light" />;
  }
};

const getStatusBadge = (status: number) => {
  const colors = {
    1: 'bg-green border-navy',
    2: 'bg-pink border-navy',
    3: 'bg-yellow border-navy',
    4: 'bg-gray border-navy',
  };
  
  return (
    <PlayfulBadge className={colors[status as keyof typeof colors] || 'bg-lavender border-navy'}>
      {statusLabels[status as keyof typeof statusLabels] || 'Unknown'}
    </PlayfulBadge>
  );
};

const formatDate = (timestamp: string) => {
  return new Date(timestamp).toLocaleString();
};

const handleReplay = (log: RedirectLog) => {
  const statusCode = log.status || statusMap[log.statusText];
  window.open(
    `${BACKEND_URL}/api/redirect?pid=${log.pid}&uid=${log.uid}&status=${statusCode}`,
    "_blank"
  );
};

const handleCopyLink = (log: RedirectLog) => {
  const statusCode = log.status || statusMap[log.statusText];
  const url = `${BACKEND_URL}/api/redirect?pid=${log.pid}&uid=${log.uid}&status=${statusCode}`;
  navigator.clipboard.writeText(url);
  alert("Link copied!");
};

export default function RedirectAnalytics({ className }: RedirectAnalyticsProps) {
  const [logs, setLogs] = useState<RedirectLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusCounts, setStatusCounts] = useState<Record<number, number>>({});
  const [filterPid, setFilterPid] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/redirect-logs?page=${currentPage}&limit=10${filterPid ? `&pid=${filterPid}` : ''}${filterStatus ? `&status=${filterStatus}` : ''}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch logs');
      }
      
      const data = await response.json();
      setLogs(data.logs || []);
      setTotalPages(data.totalPages || 1);
      setStatusCounts(data.statusCounts || {});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [currentPage, filterPid, filterStatus]);

  const chartData = Object.entries(statusCounts).map(([status, count]) => ({
    status: statusLabels[parseInt(status) as keyof typeof statusLabels],
    count,
    fill: statusColors[parseInt(status) as keyof typeof statusColors],
  }));

  const pieData = chartData.map(item => ({
    name: item.status,
    value: item.count,
    fill: item.fill,
  }));

  if (loading && logs.length === 0) {
    return (
      <div className="space-y-6">
        <PlayfulCard className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet mr-3"></div>
            <span className="text-navy-light font-jakarta">Loading redirect analytics...</span>
          </div>
        </PlayfulCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-outfit font-bold text-3xl text-navy mb-2">Redirect Analytics</h1>
          <p className="font-jakarta text-navy-light">View all survey redirect records with tracking data</p>
        </div>
        <Button onClick={fetchLogs} variant="outline" size="sm" className="w-full sm:w-auto">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PlayfulCard className="p-6">
          <h3 className="text-lg font-semibold text-navy mb-4">Status Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </PlayfulCard>

        <PlayfulCard className="p-6">
          <h3 className="text-lg font-semibold text-navy mb-4">Status Breakdown</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </PlayfulCard>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-navy-light h-4 w-4" />
          <Input
            placeholder="Filter by PID..."
            value={filterPid}
            onChange={(e) => {
              setFilterPid(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10 border-2 border-navy rounded-2xl focus:border-violet"
          />
        </div>
        
        <select
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value);
            setCurrentPage(1);
          }}
          className="px-4 py-2 border-2 border-navy rounded-2xl focus:ring-2 focus:ring-violet focus:border-transparent"
        >
          <option value="">All Statuses</option>
          <option value="1">Completed</option>
          <option value="2">Terminated</option>
          <option value="3">Quota Full</option>
          <option value="4">Security Terminated</option>
        </select>
      </div>

      {error ? (
        <PlayfulCard className="p-6 text-center">
          <AlertCircle className="h-12 w-12 text-pink mx-auto mb-4" />
          <h3 className="text-lg font-medium text-navy mb-2">Error</h3>
          <p className="font-jakarta text-navy-light mb-4">{error}</p>
          <Button onClick={fetchLogs}>Try Again</Button>
        </PlayfulCard>
      ) : logs.length === 0 ? (
        <PlayfulCard className="p-6 text-center">
          <div className="bg-periwinkle/30 rounded-full p-3 w-12 h-12 mx-auto mb-4">
            <Search className="h-6 w-6 text-navy-light" />
          </div>
          <h3 className="text-lg font-medium text-navy mb-2">
            {filterPid || filterStatus ? 'No matching records found' : 'No redirect logs available'}
          </h3>
          <p className="font-jakarta text-navy-light">
            {filterPid || filterStatus 
              ? 'Try adjusting your search terms'
              : 'Redirect records will appear here once users complete surveys'
            }
          </p>
        </PlayfulCard>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="lg:hidden space-y-3">
            {logs.map((log) => (
              <PlayfulCard key={log.id} className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(log.status)}
                      {getStatusBadge(log.status)}
                    </div>
                    <div className="flex items-center gap-1 text-navy-light">
                      <Clock className="h-3 w-3" />
                      <span className="text-xs font-mono">{formatDate(log.createdAt)}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-jakarta font-medium text-navy-light min-w-[60px]">PID:</span>
                      <span className="font-mono text-navy break-all">{log.pid}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-navy-light shrink-0" />
                      <span className="font-mono text-navy break-all">{log.uid}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-navy-light shrink-0" />
                      <span className="font-mono text-navy break-all">{log.ipAddress}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReplay(log)}
                      className="flex-1"
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Replay
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopyLink(log)}
                      className="flex-1"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </Button>
                  </div>
                </div>
              </PlayfulCard>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>PID</TableHead>
                    <TableHead>UID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow 
                      key={log.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleReplay(log)}
                    >
                      <TableCell className="font-mono text-sm">
                        {formatDate(log.createdAt)}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {log.pid}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {log.uid}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(log.status)}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {log.ipAddress}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReplay(log);
                            }}
                          >
                            <Play className="h-3 w-3 mr-1" />
                            Replay
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyLink(log);
                            }}
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Copy
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-6">
              <Button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                variant="outline"
                size="sm"
              >
                Previous
              </Button>
              
              <span className="text-sm text-navy-light">
                Page {currentPage} of {totalPages}
              </span>
              
              <Button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                variant="outline"
                size="sm"
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

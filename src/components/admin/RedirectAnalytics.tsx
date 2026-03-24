import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
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
  Activity,
  BarChart3,
  Copy
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

export default function RedirectAnalytics({ className }: RedirectAnalyticsProps) {
  const [logs, setLogs] = useState<RedirectLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusCounts, setStatusCounts] = useState<Record<number, number>>({});
  const [filterPid, setFilterPid] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const statusColors = {
    1: '#10b981', // green
    2: '#ef4444', // red
    3: '#f59e0b', // yellow
    4: '#6b7280', // gray
  };

  const statusLabels = {
    1: 'Completed',
    2: 'Terminated',
    3: 'Quota Full',
    4: 'Security Terminated',
  };

  const fetchLogs = async () => {
    const token = localStorage.getItem('surveypanelgo_token');
    if (!token) {
      setError('Not authenticated');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '50',
      });

      if (filterPid) params.append('pid', filterPid);
      if (filterStatus) params.append('status', filterStatus);

      const url = `https://survey-panelgo.onrender.com/api/redirect-logs?${params}`;
      console.log("API CALL (GET):", url);
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch redirect logs');
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Invalid API response:", text);
        throw new Error("API did not return JSON");
      }

      const data = await response.json();
      setLogs(data.logs);
      setStatusCounts(data.statusCounts);
      setTotalPages(data.pagination.pages);
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

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-8 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <PlayfulCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-outfit font-bold text-2xl text-navy mb-2">Redirect Analytics</h2>
            <p className="font-jakarta text-navy-light">Monitor and analyze survey redirect activity</p>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-violet" />
            <BarChart3 className="w-5 h-5 text-violet" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div>
            <h3 className="font-outfit font-semibold text-lg text-navy mb-4">Status Distribution</h3>
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
          </div>

          <div>
            <h3 className="font-outfit font-semibold text-lg text-navy mb-4">Status Breakdown</h3>
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
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-3 w-full">
          <input
            type="text"
            placeholder="Filter by PID..."
            value={filterPid}
            onChange={(e) => {
              setFilterPid(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full md:flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Statuses</option>
            <option value="1">Completed</option>
            <option value="2">Terminated</option>
            <option value="3">Quota Full</option>
            <option value="4">Security Terminated</option>
          </select>
        </div>

        <div className="overflow-x-auto w-full">
          <Table className="w-auto" style={{ minWidth: '900px' }}>
            <TableHeader>
              <TableRow className="bg-periwinkle/30">
                <TableHead className="font-outfit font-bold text-navy">Timestamp</TableHead>
                <TableHead className="font-outfit font-bold text-navy">PID (Click ID)</TableHead>
                <TableHead className="font-outfit font-bold text-navy">UID (User ID)</TableHead>
                <TableHead className="font-outfit font-bold text-navy">Status</TableHead>
                <TableHead className="font-outfit font-bold text-navy">IP Address</TableHead>
                <TableHead className="font-outfit font-bold text-navy">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id} className="hover:bg-periwinkle/10 cursor-pointer" onClick={() => {
                  const statusCode = log.status || statusMap[log.statusText];
                  window.open(
                    `${BACKEND_URL}/api/redirect?pid=${log.pid}&uid=${log.uid}&status=${statusCode}`,
                    "_blank"
                  );
                }}>
                  <TableCell className="font-medium min-w-[180px] max-w-[200px]">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-navy-light flex-shrink-0" />
                      <span className="text-sm font-mono whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-navy-light" />
                      <span className="font-mono text-sm truncate max-w-[120px]" title={log.pid}>
                        {log.pid}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-navy-light" />
                      <span className="font-mono text-sm truncate max-w-[120px]" title={log.uid}>
                        {log.uid}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {(() => {
                        const statusIcon = log.status === 1 ? CheckCircle : log.status === 2 ? XCircle : AlertCircle;
                        const Icon = statusIcon;
                        return <Icon className="h-4 w-4 text-navy-light" />;
                      })()}
                      <PlayfulBadge 
                        variant={log.status === 1 ? 'green' : log.status === 2 ? 'pink' : 'yellow'}
                        className="text-xs"
                      >
                        {log.statusText}
                      </PlayfulBadge>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4 text-navy-light" />
                      <span className="text-sm truncate max-w-[120px]" title={log.ipAddress}>
                        {log.ipAddress}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const statusCode = log.status || statusMap[log.statusText];
                          window.open(
                            `${BACKEND_URL}/api/redirect?pid=${log.pid}&uid=${log.uid}&status=${statusCode}`,
                            "_blank"
                          );
                        }}
                        className="px-3 py-1 bg-violet hover:bg-violet/80 text-white text-xs font-medium rounded-md transition-colors flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Replay
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const statusCode = log.status || statusMap[log.statusText];
                          const url = `${BACKEND_URL}/api/redirect?pid=${log.pid}&uid=${log.uid}&status=${statusCode}`;
                          navigator.clipboard.writeText(url);
                          alert("Link copied!");
                        }}
                        className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs font-medium rounded-md transition-colors flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" />
                        Copy
                      </button>
                    </div>
                  </TableCell>
                </tr>
              ))}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-6">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded"
            >
              Previous
            </button>
            
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded"
            >
              Next
            </button>
          </div>
        )}
      </PlayfulCard>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Activity, Clock, DollarSign, BarChart3 } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState('overview');

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
    <div className={`w-full ${className}`}>
      <div className="bg-white rounded-lg shadow min-h-0">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 overflow-x-auto">
          <nav className="flex min-w-max -mb-px space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'activity', label: 'Activity', icon: Activity },
              { id: 'timing', label: 'Timing', icon: Clock },
              { id: 'revenue', label: 'Revenue', icon: DollarSign },
              { id: 'reports', label: 'Reports', icon: BarChart3 },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon
                  className={`-ml-0.5 mr-2 h-5 w-5 flex-shrink-0 ${
                    activeTab === tab.id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                  aria-hidden="true"
                />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Redirect Analytics Overview</h2>
              
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
                <div className="w-full">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Status Distribution</h3>
                  <div className="w-full h-64">
                    <ResponsiveContainer width="100%" height="100%">
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
                </div>

                <div className="w-full">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Status Breakdown</h3>
                  <div className="w-full h-64">
                    <ResponsiveContainer width="100%" height="100%">
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
              </div>

              {/* Filters */}
              <div className="flex flex-col xl:flex-row gap-3 w-full">
                <input
                  type="text"
                  placeholder="Filter by PID..."
                  value={filterPid}
                  onChange={(e) => {
                    setFilterPid(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full xl:flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                
                <select
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full xl:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Statuses</option>
                  <option value="1">Completed</option>
                  <option value="2">Terminated</option>
                  <option value="3">Quota Full</option>
                  <option value="4">Security Terminated</option>
                </select>
              </div>

              {/* Table */}
              <div className="w-full overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-[800px] w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Timestamp
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        PID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        UID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        IP Address
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {logs.map((log) => (
                      <tr 
                        key={log.id}
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          const statusCode = log.status || statusMap[log.statusText];
                          window.open(
                            `${BACKEND_URL}/api/redirect?pid=${log.pid}&uid=${log.uid}&status=${statusCode}`,
                            "_blank"
                          );
                        }}
                      >
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          <div className="truncate max-w-[100px]" title={log.pid}>
                            {log.pid}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          <div className="truncate max-w-[100px]" title={log.uid}>
                            {log.uid}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full text-white`}
                            style={{ backgroundColor: statusColors[log.status as keyof typeof statusColors] }}
                          >
                            {log.statusText}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          <div className="truncate max-w-[100px]" title={log.ipAddress}>
                            {log.ipAddress}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex flex-wrap gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const statusCode = log.status || statusMap[log.statusText];
                                window.open(
                                  `${BACKEND_URL}/api/redirect?pid=${log.pid}&uid=${log.uid}&status=${statusCode}`,
                                  "_blank"
                                );
                              }}
                              style={{
                                padding: "4px 8px",
                                borderRadius: "4px",
                                border: "none",
                                background: "#7C83FD",
                                color: "white",
                                cursor: "pointer",
                                fontSize: "12px"
                              }}
                            >
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
                              style={{
                                padding: "4px 8px",
                                borderRadius: "4px",
                                border: "none",
                                background: "#10b981",
                                color: "white",
                                cursor: "pointer",
                                fontSize: "12px"
                              }}
                            >
                              Copy
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
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
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Detailed Analytics</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Redirects</p>
                      <p className="text-2xl font-bold text-gray-900">{logs.length}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 p-6 rounded-lg">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Unique Users</p>
                      <p className="text-2xl font-bold text-gray-900">{new Set(logs.map(log => log.uid)).size}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-50 p-6 rounded-lg">
                  <div className="flex items-center">
                    <Activity className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Success Rate</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {logs.length > 0 ? Math.round((statusCounts[1] || 0) / logs.length * 100) : 0}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">User Analysis</h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-600">User engagement and behavior analysis coming soon...</p>
              </div>
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Activity Timeline</h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-600">Activity timeline and patterns coming soon...</p>
              </div>
            </div>
          )}

          {/* Timing Tab */}
          {activeTab === 'timing' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Timing Analysis</h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-600">Timing and peak hours analysis coming soon...</p>
              </div>
            </div>
          )}

          {/* Revenue Tab */}
          {activeTab === 'revenue' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Revenue Impact</h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-600">Revenue and conversion analysis coming soon...</p>
              </div>
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Reports & Exports</h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-600">Report generation and export options coming soon...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

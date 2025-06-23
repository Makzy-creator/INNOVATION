import React from 'react';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  UserGroupIcon,
  ClockIcon,
  StarIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import { useTavusMetrics } from '../hooks/useTavusMetrics';
import { drVitaPersona } from '../data/drVitaPersona';

const TavusMetricsDashboard: React.FC = () => {
  const { metrics, exportMetrics } = useTavusMetrics();

  const getHookTitle = (hookId: string) => {
    const hook = drVitaPersona.conversationHooks.find(h => h.id === hookId);
    return hook?.title || hookId;
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const statCards = [
    {
      title: 'Total Sessions',
      value: metrics.totalSessions,
      icon: UserGroupIcon,
      color: 'bg-blue-500'
    },
    {
      title: 'Avg. Engagement',
      value: `${Math.round(metrics.averageEngagement)}%`,
      icon: ChartBarIcon,
      color: 'bg-green-500'
    },
    {
      title: 'Completed Hooks',
      value: metrics.completedHooks,
      icon: StarIcon,
      color: 'bg-purple-500'
    },
    {
      title: 'Avg. Duration',
      value: formatDuration(metrics.averageSessionDuration),
      icon: ClockIcon,
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dr. Vita Analytics</h2>
          <p className="text-gray-600">Video agent engagement and performance metrics</p>
        </div>
        <button
          onClick={exportMetrics}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <ArrowDownTrayIcon className="h-5 w-5" />
          <span>Export Data</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="card p-6"
          >
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.color} text-white`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Top Hooks */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="card p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Popular Learning Experiences</h3>
        {metrics.topHooks.length > 0 ? (
          <div className="space-y-3">
            {metrics.topHooks.map((hook, index) => (
              <div key={hook.hookId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-primary-600 font-semibold text-sm">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{getHookTitle(hook.hookId)}</p>
                    <p className="text-sm text-gray-600">{hook.completions} completions</p>
                  </div>
                </div>
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full"
                    style={{
                      width: `${(hook.completions / Math.max(...metrics.topHooks.map(h => h.completions))) * 100}%`
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <ChartBarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No interaction data available yet</p>
            <p className="text-sm">Start using Dr. Vita to see analytics</p>
          </div>
        )}
      </motion.div>

      {/* Engagement Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="card p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{metrics.totalInteractions}</p>
            <p className="text-sm text-green-700">Total Interactions</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">
              {metrics.totalSessions > 0 ? Math.round(metrics.totalInteractions / metrics.totalSessions) : 0}
            </p>
            <p className="text-sm text-blue-700">Avg. Interactions/Session</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">
              {metrics.totalSessions > 0 ? Math.round((metrics.completedHooks / metrics.totalSessions) * 100) : 0}%
            </p>
            <p className="text-sm text-purple-700">Hook Completion Rate</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TavusMetricsDashboard;
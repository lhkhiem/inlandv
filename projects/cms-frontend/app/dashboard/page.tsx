'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FileText,
  CheckCircle,
  Edit,
  Folder,
  TrendingUp,
  Users,
  Eye,
  ArrowUpRight,
} from 'lucide-react';
import { resolveApiBaseUrl } from '@/lib/api';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    totalTopics: 0,
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchStats();
  }, []);

  const getApiUrl = () => {
    const base = resolveApiBaseUrl();
    return base.endsWith('/') ? base.slice(0, -1) : base;
  };

  const fetchStats = async () => {
    try {
      const baseUrl = getApiUrl();
      const postsRes = await fetch(`${baseUrl}/api/posts`, {
        credentials: 'include',
      });
      const posts = await postsRes.json();
      const postsData = Array.isArray(posts) ? posts : (posts?.data ?? []);
      
      const topicsRes = await fetch(`${baseUrl}/api/topics`, {
        credentials: 'include',
      });
      const topics = await topicsRes.json();
      const topicsData = Array.isArray(topics) ? topics : (topics?.data ?? topics ?? []);

      setStats({
        totalPosts: postsData.length || 0,
        publishedPosts: postsData.filter((p: any) => p.status === 'published').length || 0,
        draftPosts: postsData.filter((p: any) => p.status === 'draft').length || 0,
        totalTopics: topicsData.length || 0,
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Posts',
      value: stats.totalPosts,
      icon: FileText,
      trend: '+12%',
      trendUp: true,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      title: 'Published',
      value: stats.publishedPosts,
      icon: CheckCircle,
      trend: '+8%',
      trendUp: true,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      title: 'Drafts',
      value: stats.draftPosts,
      icon: Edit,
      trend: '-3%',
      trendUp: false,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
    },
    {
      title: 'Topics',
      value: stats.totalTopics,
      icon: Folder,
      trend: '+2',
      trendUp: true,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
    },
  ];

  return (
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your content.
          </p>
        </div>

        {/* Stats Grid */}
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-32 animate-pulse rounded-lg border border-border bg-card"
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {statCards.map((stat) => (
              <div
                key={stat.title}
                className="group relative overflow-hidden rounded-lg border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold text-card-foreground">
                      {stat.value}
                    </p>
                  </div>
                  <div className={cn('rounded-lg p-2', stat.bgColor)}>
                    <stat.icon className={cn('h-5 w-5', stat.color)} />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-xs">
                  <span
                    className={cn(
                      'font-medium',
                      stat.trendUp ? 'text-green-600' : 'text-red-600'
                    )}
                  >
                    {stat.trend}
                  </span>
                  <span className="text-muted-foreground">from last month</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div>
          <h2 className="mb-4 text-xl font-semibold text-foreground">
            Quick Actions
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Link
              href="/dashboard/posts"
              className={cn(
                'group relative overflow-hidden rounded-lg border border-border bg-card p-6',
                'transition-all hover:shadow-md hover:border-primary'
              )}
            >
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900/20">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors">
                    Manage Posts
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Create and edit blog posts
                  </p>
                </div>
                <ArrowUpRight className="h-5 w-5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            </Link>

            <Link
              href="/dashboard/topics"
              className={cn(
                'group relative overflow-hidden rounded-lg border border-border bg-card p-6',
                'transition-all hover:shadow-md hover:border-primary'
              )}
            >
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-purple-100 p-3 dark:bg-purple-900/20">
                  <Folder className="h-6 w-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors">
                    Topics
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Organize content by topics
                  </p>
                </div>
                <ArrowUpRight className="h-5 w-5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            </Link>

            <Link
              href="/dashboard/media"
              className={cn(
                'group relative overflow-hidden rounded-lg border border-border bg-card p-6',
                'transition-all hover:shadow-md hover:border-primary'
              )}
            >
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-green-100 p-3 dark:bg-green-900/20">
                  <Eye className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors">
                    Media Library
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Upload and manage media files
                  </p>
                </div>
                <ArrowUpRight className="h-5 w-5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Activity Placeholder */}
        <div>
          <h2 className="mb-4 text-xl font-semibold text-foreground">
            Recent Activity
          </h2>
          <div className="rounded-lg border border-border bg-card p-12 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <TrendingUp className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-card-foreground mb-2">
              Activity Tracking Coming Soon
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Track content changes, user actions, and system events in real-time.
            </p>
          </div>
        </div>
      </div>
  );
}

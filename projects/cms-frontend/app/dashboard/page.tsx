'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FileText,
  TrendingUp,
  Users,
  Eye,
  ArrowUpRight,
  Package,
  Grid3x3,
} from 'lucide-react';
import { buildApiUrl } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalIndustrialParks: 0,
    totalNews: 0,
    totalLeads: 0,
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    // Only fetch stats when user is authenticated
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Fetch properties count
      try {
        const propertiesRes = await fetch(buildApiUrl('/properties?pageSize=1'), {
          credentials: 'include',
        });
        if (propertiesRes.ok) {
          const properties = await propertiesRes.json();
          const count = properties?.total ?? (Array.isArray(properties?.data) ? properties.data.length : 0);
          setStats(prev => ({ ...prev, totalProperties: count }));
        }
      } catch (error) {
        console.error('Failed to fetch properties:', error);
      }

      // Fetch industrial parks count
      try {
        const parksRes = await fetch(buildApiUrl('/industrial-parks'), {
          credentials: 'include',
        });
        if (parksRes.ok) {
          const parks = await parksRes.json();
          const count = parks?.count ?? (Array.isArray(parks?.data) ? parks.data.length : 0);
          setStats(prev => ({ ...prev, totalIndustrialParks: count }));
        }
      } catch (error) {
        console.error('Failed to fetch industrial parks:', error);
      }

      // Fetch news count
      try {
        const newsRes = await fetch(buildApiUrl('/news'), {
          credentials: 'include',
        });
        if (newsRes.ok) {
          const news = await newsRes.json();
          const count = news?.count ?? (Array.isArray(news?.data) ? news.data.length : 0);
          setStats(prev => ({ ...prev, totalNews: count }));
        }
      } catch (error) {
        console.error('Failed to fetch news:', error);
      }

      // Fetch leads count
      try {
        const leadsRes = await fetch(buildApiUrl('/leads'), {
          credentials: 'include',
        });
        if (leadsRes.ok) {
          const leads = await leadsRes.json();
          const count = leads?.pagination?.total ?? (Array.isArray(leads?.data) ? leads.data.length : 0);
          setStats(prev => ({ ...prev, totalLeads: count }));
        }
      } catch (error) {
        console.error('Failed to fetch leads:', error);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Bất động sản',
      value: stats.totalProperties,
      icon: Package,
      trend: '',
      trendUp: true,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      title: 'Khu công nghiệp',
      value: stats.totalIndustrialParks,
      icon: Grid3x3,
      trend: '',
      trendUp: true,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      title: 'Tin tức',
      value: stats.totalNews,
      icon: FileText,
      trend: '',
      trendUp: true,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
    },
    {
      title: 'Leads',
      value: stats.totalLeads,
      icon: Users,
      trend: '',
      trendUp: true,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
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
                {stat.trend && (
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
                )}
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
              href="/dashboard/real-estate"
              className={cn(
                'group relative overflow-hidden rounded-lg border border-border bg-card p-6',
                'transition-all hover:shadow-md hover:border-primary'
              )}
            >
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900/20">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors">
                    Quản lý Bất động sản
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Tạo và chỉnh sửa bất động sản
                  </p>
                </div>
                <ArrowUpRight className="h-5 w-5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            </Link>

            <Link
              href="/dashboard/products"
              className={cn(
                'group relative overflow-hidden rounded-lg border border-border bg-card p-6',
                'transition-all hover:shadow-md hover:border-primary'
              )}
            >
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-green-100 p-3 dark:bg-green-900/20">
                  <Grid3x3 className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors">
                    Quản lý Khu công nghiệp
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Tạo và chỉnh sửa khu công nghiệp
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
                <div className="rounded-lg bg-purple-100 p-3 dark:bg-purple-900/20">
                  <Eye className="h-6 w-6 text-purple-600" />
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

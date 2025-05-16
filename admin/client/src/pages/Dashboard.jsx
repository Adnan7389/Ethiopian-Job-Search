import { useState, useEffect } from 'react';
import { getDashboardStats } from '../services/api';
import {
  FiUsers,
  FiBriefcase,
  FiFileText,
  FiRefreshCw,
  FiAlertCircle,
  FiCheckCircle,
  FiTrendingUp,
  FiBarChart2,
  FiPieChart
} from 'react-icons/fi';
import styles from './Dashboard.module.css';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getDashboardStats();
      setStats(res.data.data);
      setLastUpdated(new Date());
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return (
    <div className={styles.loadingState} aria-live="polite" aria-busy="true">
      <FiRefreshCw className={styles.loadingIcon} />
      <p className={styles.loadingText}>Loading dashboard...</p>
    </div>
  );

  if (error) return (
    <div className={styles.errorState} role="alert">
      <FiAlertCircle className={styles.errorIcon} />
      <p className={styles.errorText}>{error}</p>
      <button 
        onClick={fetchData}
        className={styles.retryButton}
        aria-label="Retry loading dashboard"
      >
        Try Again
      </button>
    </div>
  );

  if (!stats) return null;

  // Calculate totals for percentage calculations
  const totalJobs = stats.jobsByStatus.reduce((total, job) => total + job.count, 0);
  const totalApplications = stats.applicationsByStatus.reduce((total, app) => total + app.count, 0);
  const maxIndustryCount = Math.max(...stats.jobsByIndustry.map(i => i.count));

  return (
    <div className={styles.dashboard}>
      <header className={styles.dashboardHeader}>
        <div>
          <h1 className={styles.dashboardTitle}>Dashboard Overview</h1>
          <p className={styles.dashboardSubtitle}>
            Key metrics and statistics at a glance
            {lastUpdated && (
              <span className={styles.lastUpdated}>
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <button 
          onClick={fetchData}
          className={styles.refreshButton}
          aria-label="Refresh data"
        >
          <FiRefreshCw />
          Refresh
        </button>
      </header>

      <section className={styles.statsGrid}>
        {/* Stat Card - Active Users */}
        <article className={styles.statCard} aria-labelledby="active-users-title">
          <div className={styles.statIcon} aria-hidden="true">
            <FiUsers />
          </div>
          <div className={styles.statContent}>
            <h3 id="active-users-title" className={styles.statTitle}>Active Users</h3>
            <p className={styles.statValue}>{stats.activeUsers.toLocaleString()}</p>
            <div className={styles.statTrend}>
              <FiTrendingUp />
              <span>12% from last month</span>
            </div>
          </div>
        </article>

        {/* Stat Card - Total Jobs */}
        <article className={styles.statCard} aria-labelledby="total-jobs-title">
          <div className={styles.statIcon} aria-hidden="true">
            <FiBriefcase />
          </div>
          <div className={styles.statContent}>
            <h3 id="total-jobs-title" className={styles.statTitle}>Total Jobs</h3>
            <p className={styles.statValue}>{totalJobs.toLocaleString()}</p>
            <div className={styles.statTrend}>
              <FiTrendingUp />
              <span>8% from last month</span>
            </div>
          </div>
        </article>

        {/* Stat Card - Total Applications */}
        <article className={styles.statCard} aria-labelledby="total-apps-title">
          <div className={styles.statIcon} aria-hidden="true">
            <FiFileText />
          </div>
          <div className={styles.statContent}>
            <h3 id="total-apps-title" className={styles.statTitle}>Total Applications</h3>
            <p className={styles.statValue}>{totalApplications.toLocaleString()}</p>
            <div className={styles.statTrend}>
              <FiTrendingUp />
              <span>15% from last month</span>
            </div>
          </div>
        </article>

        {/* Stat Card - Active Jobs */}
        <article className={styles.statCard} aria-labelledby="active-jobs-title">
          <div className={styles.statIcon} aria-hidden="true">
            <FiCheckCircle />
          </div>
          <div className={styles.statContent}>
            <h3 id="active-jobs-title" className={styles.statTitle}>Active Jobs</h3>
            <p className={styles.statValue}>
              {(stats.jobsByStatus.find(job => job.status === 'open')?.count || 0).toLocaleString()}
            </p>
            <div className={styles.statTrend}>
              <FiTrendingUp />
              <span>5% from last month</span>
            </div>
          </div>
        </article>
      </section>

      <section className={styles.chartsSection}>
        {/* Jobs by Status Chart */}
        <article className={styles.chartCard} aria-labelledby="jobs-status-title">
          <header className={styles.chartHeader}>
            <FiBarChart2 className={styles.chartIcon} />
            <h3 id="jobs-status-title" className={styles.chartTitle}>Jobs by Status</h3>
          </header>
          <div className={styles.chartContent}>
            {stats.jobsByStatus.map(job => (
              <div key={job.status} className={styles.chartItem}>
                <div className={styles.chartInfo}>
                  <span className={styles.chartLabel}>{job.status}</span>
                  <span className={styles.chartValue}>
                    {job.count} <span className={styles.percentage}>({Math.round((job.count / totalJobs) * 100)}%)</span>
                  </span>
                </div>
                <div className={styles.chartBarContainer}>
                  <div 
                    className={styles.chartBar}
                    style={{ width: `${(job.count / totalJobs) * 100}%` }}
                    aria-hidden="true"
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </article>

        {/* Applications by Status Chart */}
        <article className={styles.chartCard} aria-labelledby="apps-status-title">
          <header className={styles.chartHeader}>
            <FiPieChart className={styles.chartIcon} />
            <h3 id="apps-status-title" className={styles.chartTitle}>Applications by Status</h3>
          </header>
          <div className={styles.chartContent}>
            {stats.applicationsByStatus.map(app => (
              <div key={app.status} className={styles.chartItem}>
                <div className={styles.chartInfo}>
                  <span className={styles.chartLabel}>{app.status}</span>
                  <span className={styles.chartValue}>
                    {app.count} <span className={styles.percentage}>({Math.round((app.count / totalApplications) * 100)}%)</span>
                  </span>
                </div>
                <div className={styles.chartBarContainer}>
                  <div 
                    className={styles.chartBar}
                    style={{ width: `${(app.count / totalApplications) * 100}%` }}
                    aria-hidden="true"
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </article>

        {/* Jobs by Industry Chart */}
        <article className={styles.chartCard} aria-labelledby="jobs-industry-title">
          <header className={styles.chartHeader}>
            <FiBarChart2 className={styles.chartIcon} />
            <h3 id="jobs-industry-title" className={styles.chartTitle}>Jobs by Industry</h3>
          </header>
          <div className={styles.chartContent}>
            {stats.jobsByIndustry.map(industry => (
              <div key={industry.industry} className={styles.chartItem}>
                <div className={styles.chartInfo}>
                  <span className={styles.chartLabel}>{industry.industry}</span>
                  <span className={styles.chartValue}>{industry.count}</span>
                </div>
                <div className={styles.chartBarContainer}>
                  <div 
                    className={styles.chartBar}
                    style={{ width: `${(industry.count / maxIndustryCount) * 100}%` }}
                    aria-hidden="true"
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
};

export default Dashboard;
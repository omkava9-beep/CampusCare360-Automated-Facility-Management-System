import React from 'react';
import { useSelector } from 'react-redux';
import { Wallet, TrendingUp, Calendar, ArrowUpRight, DollarSign } from 'lucide-react';
import './Earnings.css';

const Earnings = () => {
    const { stats, grievances } = useSelector(state => state.contractor);
    
    const completedTasks = grievances.filter(g => g.status === 'done');
    const totalEarnings = completedTasks.length * 500;

    const weeklyStats = [
        { day: 'Mon', amount: 500 },
        { day: 'Tue', amount: 1000 },
        { day: 'Wed', amount: 500 },
        { day: 'Thu', amount: 0 },
        { day: 'Fri', amount: 1500 },
        { day: 'Sat', amount: 500 },
        { day: 'Sun', amount: 0 },
    ];

    return (
        <div className="earnings-page">
            <header className="page-header">
                <div className="header-left">
                    <h1>My Earnings</h1>
                    <p>Track your payouts and task performance.</p>
                </div>
                <div className="wallet-card glass-panel">
                    <div className="wallet-info">
                        <span className="label">Available Balance</span>
                        <span className="amount">₹ {totalEarnings}</span>
                    </div>
                    <button className="withdraw-btn">Withdraw</button>
                </div>
            </header>

            <div className="earnings-grid">
                <div className="stats-main glass-panel">
                    <h3>Weekly Revenue</h3>
                    <div className="chart-container">
                        {weeklyStats.map((s, i) => (
                            <div key={i} className="chart-bar-wrap">
                                <div className="bar" style={{ height: `${(s.amount / 1500) * 100}%` }}>
                                    {s.amount > 0 && <span className="tooltip">₹{s.amount}</span>}
                                </div>
                                <span className="day">{s.day}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="payout-history glass-panel">
                    <h3>Recent Payouts</h3>
                    <div className="payout-list">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="payout-item">
                                <div className="payout-icon"><TrendingUp size={16} /></div>
                                <div className="payout-details">
                                    <span className="p-title">Payment Processed</span>
                                    <span className="p-date">Mar {20 - i}, 2024</span>
                                </div>
                                <span className="p-amount">+ ₹1500</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="tasks-feedback glass-panel">
                <h3>Earnings by Task</h3>
                <div className="task-table">
                    <div className="table-header">
                        <span>Task ID</span>
                        <span>Date</span>
                        <span>Status</span>
                        <span>Earned</span>
                    </div>
                    {completedTasks.slice(0, 5).map(task => (
                        <div key={task._id} className="table-row">
                            <span className="t-id">{task.ticketID}</span>
                            <span>{new Date(task.updatedAt).toLocaleDateString()}</span>
                            <span className="t-status">Resolved</span>
                            <span className="t-earned">₹ 500</span>
                        </div>
                    ))}
                    {completedTasks.length === 0 && <p className="no-data">No completed tasks yet.</p>}
                </div>
            </div>
        </div>
    );
};

export default Earnings;

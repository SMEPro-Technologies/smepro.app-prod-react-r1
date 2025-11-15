import React, { useState } from 'react';
import { AdminUser, SupportTicket, Subscription } from '../../types';
import { getEffectivePlan } from '../../services/backend';
import { SmeProLogo, UsersIcon, UsageIcon, TicketIcon, LogoutIcon } from '../icons';
import UsageMeter from '../UsageMeter';

interface AdminDashboardProps {
    onLogout: () => void;
}

// --- Mock Data ---
const mockUsers: AdminUser[] = [
    { id: 'usr_1', name: 'Alice Johnson', email: 'alice.j@example.com', subscription: { id: 'sub_1', planType: 'business', levelUpPackage: 'business-adv', status: 'active', billingCycle: 'monthly' }, signupDate: '2023-10-26' },
    { id: 'usr_2', name: 'Bob Williams', email: 'bob.w@example.com', subscription: { id: 'sub_2', planType: 'business', levelUpPackage: null, status: 'active', billingCycle: 'monthly' }, signupDate: '2023-10-24' },
    { id: 'usr_3', name: 'Charlie Brown', email: 'charlie.b@example.com', subscription: { id: 'sub_3', planType: 'solo', levelUpPackage: 'solo-plus', status: 'trialing', billingCycle: 'annual' }, signupDate: '2023-10-20' },
    { id: 'usr_4', name: 'Diana Prince', email: 'diana.p@example.com', subscription: { id: 'sub_4', planType: 'solo', levelUpPackage: null, status: 'canceled', billingCycle: 'monthly' }, signupDate: '2023-09-15' },
    { id: 'usr_5', name: 'Ethan Hunt', email: 'ethan.h@example.com', subscription: { id: 'sub_5', planType: 'business', levelUpPackage: 'enterprise-oem', status: 'active', billingCycle: 'annual' }, signupDate: '2023-08-01' },
];


const mockTickets: SupportTicket[] = [
    { id: 'tic_1', userEmail: 'charlie.b@example.com', subject: 'Billing question', submittedAt: '2023-10-27 10:00', status: 'Open' },
    { id: 'tic_2', userEmail: 'alice.j@example.com', subject: 'Feature request: API access', submittedAt: '2023-10-26 14:30', status: 'In Progress' },
    { id: 'tic_3', userEmail: 'bob.w@example.com', subject: 'Vault analysis not working', submittedAt: '2023-10-25 09:12', status: 'Closed' },
];
// --- End Mock Data ---

const CustomersView: React.FC = () => (
    <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
        <table className="w-full text-sm text-left text-slate-300">
            <thead className="text-xs text-slate-400 uppercase bg-slate-900/50">
                <tr>
                    <th scope="col" className="px-6 py-3">Name</th>
                    <th scope="col" className="px-6 py-3">Email</th>
                    <th scope="col" className="px-6 py-3">Plan</th>
                    <th scope="col" className="px-6 py-3">Signup Date</th>
                    <th scope="col" className="px-6 py-3">Status</th>
                </tr>
            </thead>
            <tbody>
                {mockUsers.map(user => {
                    const effectivePlan = getEffectivePlan(user.subscription);
                    return (
                        <tr key={user.id} className="border-t border-slate-700 hover:bg-slate-800/50">
                            <td className="px-6 py-4 font-medium text-white">{user.name}</td>
                            <td className="px-6 py-4">{user.email}</td>
                            <td className="px-6 py-4 capitalize">{effectivePlan.replace('-', '+')}</td>
                            <td className="px-6 py-4">{user.signupDate}</td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                    user.subscription.status === 'active' ? 'bg-green-500/20 text-green-300' :
                                    user.subscription.status === 'trialing' ? 'bg-yellow-500/20 text-yellow-300' :
                                    'bg-red-500/20 text-red-300'
                                }`}>{user.subscription.status}</span>
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    </div>
);

const QuotasView: React.FC = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockUsers.filter(u => u.subscription.status === 'active').map(user => (
            <div key={user.id} className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                <h4 className="text-lg font-bold text-white">{user.name}</h4>
                <p className="text-sm text-slate-400 mb-4">{user.email}</p>
                <div className="space-y-3">
                    <UsageMeter title="Vault Storage" used={Math.random() * 10} limit={50} unit="GB" />
                    <UsageMeter title="Analyzer Actions" used={Math.floor(Math.random() * 200)} limit={500} unit="Actions" />
                </div>
            </div>
        ))}
    </div>
);

const SupportTicketsView: React.FC = () => (
    <div className="space-y-4">
        {mockTickets.map(ticket => (
             <div key={ticket.id} className="p-4 bg-slate-800 rounded-lg border border-slate-700 flex justify-between items-start">
                <div>
                    <h4 className="font-bold text-white">{ticket.subject}</h4>
                    <p className="text-sm text-slate-400">{ticket.userEmail} - <span className="text-xs">{ticket.submittedAt}</span></p>
                </div>
                <div className="flex items-center space-x-4">
                     <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        ticket.status === 'Open' ? 'bg-cyan-500/20 text-cyan-300' :
                        ticket.status === 'In Progress' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-green-500/20 text-green-300'
                    }`}>{ticket.status}</span>
                    <button className="text-sm text-cyan-400 hover:underline">View</button>
                </div>
             </div>
        ))}
    </div>
);


const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
    const [activeView, setActiveView] = useState<'customers' | 'quotas' | 'tickets'>('customers');

    const renderView = () => {
        switch (activeView) {
            case 'customers': return <CustomersView />;
            case 'quotas': return <QuotasView />;
            case 'tickets': return <SupportTicketsView />;
            default: return <CustomersView />;
        }
    };
    
    const NavItem: React.FC<{ icon: React.ReactNode, label: string, view: typeof activeView, onClick: () => void }> = ({ icon, label, view, onClick }) => (
        <button onClick={onClick} className={`flex items-center space-x-3 w-full px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${activeView === view ? 'bg-cyan-500/10 text-cyan-300' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}>
            {icon}
            <span>{label}</span>
        </button>
    );

    return (
        <div className="flex h-screen bg-slate-900 text-slate-300 font-sans">
            {/* Sidebar */}
            <aside className="w-64 flex-shrink-0 bg-slate-800/50 border-r border-slate-700 flex flex-col">
                <div className="flex items-center space-x-3 p-4 border-b border-slate-700">
                    <SmeProLogo className="w-8 h-8"/>
                    <h1 className="text-xl font-bold text-white">SMEPro Admin</h1>
                </div>
                <nav className="flex-grow p-4 space-y-2">
                    <NavItem icon={<UsersIcon className="w-5 h-5"/>} label="Customers" view="customers" onClick={() => setActiveView('customers')} />
                    <NavItem icon={<UsageIcon className="w-5 h-5"/>} label="Quotas" view="quotas" onClick={() => setActiveView('quotas')} />
                    <NavItem icon={<TicketIcon className="w-5 h-5"/>} label="Support Tickets" view="tickets" onClick={() => setActiveView('tickets')} />
                </nav>
                 <div className="p-4 border-t border-slate-700">
                    <button onClick={onLogout} className="flex items-center space-x-3 w-full px-3 py-2.5 rounded-md text-sm font-medium transition-colors text-slate-400 hover:bg-slate-700 hover:text-white">
                        <LogoutIcon className="w-5 h-5" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="p-6">
                    <h2 className="text-2xl font-bold text-white capitalize">{activeView} Management</h2>
                    <p className="text-slate-400">Viewing and managing all application {activeView}.</p>
                </header>
                <div className="flex-1 overflow-y-auto px-6 pb-6">
                    {renderView()}
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
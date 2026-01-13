import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/api/client';
import AdminLayout from '@/components/layout/AdminLayout';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import {
    Search,
    MessageSquare,
    ChevronRight,
    User,
    Send,
    Loader2
} from 'lucide-react';
import { cn } from '@/utils/cn';
import toast from 'react-hot-toast';

interface Ticket {
    _id: string;
    subject: string;
    category: string;
    description: string;
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    patientId: {
        _id: string;
        name: string;
        email: string;
        phone: string;
    };
    lastReplyAt: string;
    createdAt: string;
}

interface Reply {
    _id: string;
    content: string;
    senderRole: 'ADMIN' | 'PATIENT';
    senderId: string;
    createdAt: string;
}

const statusColors = {
    OPEN: 'bg-blue-100 text-blue-700 border-blue-200',
    IN_PROGRESS: 'bg-amber-100 text-amber-700 border-amber-200',
    RESOLVED: 'bg-green-100 text-green-700 border-green-200',
    CLOSED: 'bg-gray-100 text-gray-700 border-gray-200',
};

const priorityColors = {
    LOW: 'bg-gray-100 text-gray-600',
    MEDIUM: 'bg-blue-100 text-blue-600',
    HIGH: 'bg-orange-100 text-orange-600',
    URGENT: 'bg-red-100 text-red-600',
};

export default function Support() {
    const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
    const [replyContent, setReplyContent] = useState('');
    const queryClient = useQueryClient();

    // Fetch all tickets
    const { data: tickets, isLoading: isLoadingTickets } = useQuery<Ticket[]>({
        queryKey: ['support-tickets'],
        queryFn: async () => {
            const response = await apiClient.get('/support-tickets');
            return response.data;
        },
    });

    // Fetch ticket details (replies)
    const { data: ticketDetails, isLoading: isLoadingDetails } = useQuery<{ ticket: Ticket; replies: Reply[] }>({
        queryKey: ['support-ticket', selectedTicketId],
        queryFn: async () => {
            const response = await apiClient.get(`/support-tickets/${selectedTicketId}`);
            return response.data;
        },
        enabled: !!selectedTicketId,
    });

    // Send reply mutation
    const sendReplyMutation = useMutation({
        mutationFn: async (content: string) => {
            await apiClient.post(`/support-tickets/${selectedTicketId}/replies`, { content });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['support-ticket', selectedTicketId] });
            setReplyContent('');
            toast.success('تم إرسال الرد بنجاح');
        },
        onError: () => {
            toast.error('فشل إرسال الرد');
        },
    });

    // Update status mutation
    const updateStatusMutation = useMutation({
        mutationFn: async (status: string) => {
            await apiClient.patch(`/support-tickets/${selectedTicketId}`, { status });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
            queryClient.invalidateQueries({ queryKey: ['support-ticket', selectedTicketId] });
            toast.success('تم تحديث حالة التذكرة');
        },
    });

    const handleSendReply = (e: React.FormEvent) => {
        e.preventDefault();
        if (replyContent.trim()) {
            sendReplyMutation.mutate(replyContent);
        }
    };

    return (
        <AdminLayout>
            <Breadcrumbs />
            <div className="h-[calc(100vh-180px)] flex gap-6 text-right">
                {/* Tickets List */}
                <div className={cn(
                    "flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 transition-all",
                    selectedTicketId ? "max-w-md hidden lg:flex" : "max-w-full"
                )}>
                <div className="p-6 border-b border-gray-100">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">تذاكر الدعم الفني</h1>
                    <div className="relative">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            className="w-full pr-10 pl-4 py-2 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-[#6366f1]/20 outline-none transition-all text-sm"
                            placeholder="البحث في التذاكر..."
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2">
                    {isLoadingTickets ? (
                        <div className="flex items-center justify-center h-full">
                            <Loader2 className="w-8 h-8 text-[#6366f1] animate-spin" />
                        </div>
                    ) : tickets?.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <MessageSquare className="w-12 h-12 mb-2 opacity-20" />
                            <p>لا توجد تذاكر حالياً</p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {tickets?.map((ticket) => (
                                <button
                                    key={ticket._id}
                                    onClick={() => setSelectedTicketId(ticket._id)}
                                    className={cn(
                                        "w-full text-right p-4 rounded-xl transition-all hover:bg-gray-50 group",
                                        selectedTicketId === ticket._id ? "bg-[#6366f1]/5 border-[#6366f1]/20 border" : "border-transparent border"
                                    )}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={cn(
                                            "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                                            priorityColors[ticket.priority]
                                        )}>
                                            {ticket.priority}
                                        </span>
                                        <span className="text-[10px] text-gray-400">
                                            {new Date(ticket.createdAt).toLocaleDateString('ar-SA')}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-gray-900 line-clamp-1 group-hover:text-[#6366f1]">
                                        {ticket.subject}
                                    </h3>
                                    <p className="text-xs text-gray-500 mb-3">{ticket.patientId?.name || 'مستخدم غير معروف'}</p>
                                    <div className="flex items-center justify-between">
                                        <span className={cn(
                                            "px-2.5 py-1 rounded-full text-xs border font-medium",
                                            statusColors[ticket.status]
                                        )}>
                                            {ticket.status}
                                        </span>
                                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#6366f1] transition-transform group-hover:translate-x-[-4px]" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Ticket Chat / Detail View */}
            <div className={cn(
                "flex-[2] bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col",
                !selectedTicketId && "hidden lg:flex items-center justify-center bg-gray-50/50"
            )}>
                {selectedTicketId ? (
                    isLoadingDetails ? (
                        <div className="flex items-center justify-center h-full">
                            <Loader2 className="w-8 h-8 text-[#6366f1] animate-spin" />
                        </div>
                    ) : (
                        <>
                            {/* Detail Header */}
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-[#6366f1]/10 rounded-xl flex items-center justify-center">
                                        <User className="w-6 h-6 text-[#6366f1]" />
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-lg text-gray-900">{ticketDetails?.ticket.patientId?.name || 'مستخدم غير معروف'}</h2>
                                        <p className="text-sm text-gray-500">{ticketDetails?.ticket.patientId?.email || 'لا يوجد بريد إلكتروني'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <select
                                        value={ticketDetails?.ticket.status}
                                        onChange={(e) => updateStatusMutation.mutate(e.target.value)}
                                        className="p-2 border rounded-lg text-sm bg-white"
                                    >
                                        <option value="OPEN">قيد الانتظار</option>
                                        <option value="IN_PROGRESS">جاري العمل</option>
                                        <option value="RESOLVED">تم الحل</option>
                                        <option value="CLOSED">مغلقة</option>
                                    </select>
                                    <button
                                        onClick={() => setSelectedTicketId(null)}
                                        className="lg:hidden px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                                    >
                                        إغلاق
                                    </button>
                                </div>
                            </div>

                            {/* Chat Area */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30">
                                {/* Original Description */}
                                <div className="flex justify-start">
                                    <div className="max-w-[80%] bg-blue-50 border border-blue-100 rounded-2xl rounded-tr-none p-4 shadow-sm">
                                        <p className="text-xs font-bold text-blue-600 mb-2">الوصف الأصلي</p>
                                        <p className="text-gray-800">{ticketDetails?.ticket.description}</p>
                                    </div>
                                </div>

                                {ticketDetails?.replies.map((reply) => (
                                    <div key={reply._id} className={cn(
                                        "flex",
                                        reply.senderRole === 'ADMIN' ? "justify-end" : "justify-start"
                                    )}>
                                        <div className={cn(
                                            "max-w-[80%] p-4 rounded-2xl shadow-sm",
                                            reply.senderRole === 'ADMIN'
                                                ? "bg-[#6366f1] text-white rounded-tl-none"
                                                : "bg-white border border-gray-100 text-gray-800 rounded-tr-none"
                                        )}>
                                            <p className="text-sm">{reply.content}</p>
                                            <p className={cn(
                                                "text-[10px] mt-2 opacity-60",
                                                reply.senderRole === 'ADMIN' ? "text-left" : "text-right"
                                            )}>
                                                {new Date(reply.createdAt).toLocaleString('ar-SA')}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Reply Input */}
                            <form onSubmit={handleSendReply} className="p-6 border-t border-gray-100 bg-white rounded-b-2xl">
                                <div className="flex gap-2">
                                    <input
                                        value={replyContent}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReplyContent(e.target.value)}
                                        placeholder="اكتب ردك هنا..."
                                        className="flex-1 bg-gray-50 border-none rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#6366f1]/20 outline-none text-sm transition-all"
                                        disabled={sendReplyMutation.isPending}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!replyContent.trim() || sendReplyMutation.isPending}
                                        className="inline-flex items-center justify-center w-10 h-10 bg-[#6366f1] text-white rounded-lg hover:bg-[#4f46e5] disabled:opacity-50 transition-all shadow-sm shadow-[#6366f1]/20"
                                    >
                                        {sendReplyMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                    </button>
                                </div>
                            </form>
                        </>
                    )
                ) : (
                    <div className="flex flex-col items-center justify-center text-gray-400">
                        <MessageSquare className="w-16 h-16 mb-4 opacity-10" />
                        <p className="text-lg">اختر تذكرة لعرض التفاصيل والرد عليها</p>
                    </div>
                )}
            </div>
        </div>
    </AdminLayout>
);
}

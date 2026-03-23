import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Package } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  OrderCommentDto,
  OrderDetailsDto,
  orderService,
} from '../../services/order.service';
import { formatPriceToman } from '../../utils/format';
import { DashboardPageHeader } from '../../components/dashboard/DashboardPageHeader';
import { DashboardCard } from '../../components/dashboard/DashboardCard';

const apiBaseUrl = () => import.meta.env.VITE_API_URL || 'http://localhost:3005';

const getImageUrl = (path: string | null | undefined): string | null => {
  if (!path) return null;
  if (
    path.startsWith('http') ||
    path.startsWith('blob:') ||
    path.startsWith('data:')
  ) {
    return path;
  }
  const base = apiBaseUrl();
  return path.startsWith('/') ? `${base}${path}` : `${base}/${path}`;
};

export const DashboardOrderDetail: React.FC = () => {
  const { t, language } = useLanguage();
  const { orderCode } = useParams<{ orderCode: string }>();
  const isRtl = language === 'fa';

  const [order, setOrder] = useState<OrderDetailsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentSaving, setCommentSaving] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState('');

  const addressText = useMemo(() => {
    const a = (order?.shippingAddress ?? null) as Record<string, unknown> | null;
    if (!a) return null;
    const parts = [
      typeof a.province === 'string' && typeof a.city === 'string'
        ? `${a.province} - ${a.city}`
        : null,
      typeof a.address === 'string' ? a.address : null,
      typeof a.plaque === 'string' ? (language === 'fa' ? `پلاک ${a.plaque}` : `Plaque ${a.plaque}`) : null,
      typeof a.unit === 'string' ? (language === 'fa' ? `واحد ${a.unit}` : `Unit ${a.unit}`) : null,
      typeof a.postalCode === 'string'
        ? language === 'fa'
          ? `کدپستی ${a.postalCode}`
          : `Postal ${a.postalCode}`
        : null,
    ].filter(Boolean);
    return parts.join(' | ');
  }, [language, order?.shippingAddress]);

  useEffect(() => {
    if (!orderCode) return;
    let cancelled = false;
    setLoading(true);
    orderService
      .getOrderByCode(orderCode)
      .then((data) => {
        if (cancelled) return;
        setOrder(data);
      })
      .catch(() => {
        if (cancelled) return;
        setOrder(null);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [orderCode]);

  const comments = useMemo(() => order?.comments ?? [], [order?.comments]);
  const commentsByParent = useMemo(() => {
    const map = new Map<string | null, OrderCommentDto[]>();
    for (const c of comments) {
      const key = c.parentId ?? null;
      const arr = map.get(key) ?? [];
      arr.push(c);
      map.set(key, arr);
    }
    return map;
  }, [comments]);

  const formatDateTime = useMemo(() => {
    try {
      const locale = language === 'fa' ? 'fa-IR' : 'en-US';
      return (value: string) =>
        new Intl.DateTimeFormat(locale, {
          year: 'numeric',
          month: 'short',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        }).format(new Date(value));
    } catch {
      return (value: string) => value;
    }
  }, [language]);

  const resolveOrderStatus = (
    o: OrderDetailsDto,
  ): NonNullable<OrderDetailsDto['orderStatus']> => {
    if (o.orderStatus) return o.orderStatus;
    if (o.paymentStatus === 'PAID') return 'PAID';
    if (o.paymentStatus === 'FAILED') return 'CANCELED';
    return 'PENDING_PAYMENT';
  };

  const statusBadgeClass = (status?: OrderDetailsDto['orderStatus']) => {
    const s = status ?? 'PENDING_PAYMENT';
    if (s === 'DELIVERED') return 'bg-green-100 text-green-700 border-green-200';
    if (s === 'CANCELED') return 'bg-red-100 text-red-700 border-red-200';
    if (s === 'SHIPPED') return 'bg-blue-100 text-blue-700 border-blue-200';
    if (s === 'CONFIRMED') return 'bg-purple-100 text-purple-700 border-purple-200';
    if (s === 'PAID') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    return 'bg-amber-100 text-amber-700 border-amber-200';
  };

  const authorLabel = (c: OrderCommentDto) => {
    if (c.authorRole === 'ADMIN') return language === 'fa' ? 'ادمین' : 'Admin';
    return language === 'fa' ? 'شما' : 'You';
  };

  const renderComment = (c: OrderCommentDto, depth: number) => {
    const replies = commentsByParent.get(c.id) ?? [];
    const bg =
      c.authorRole === 'ADMIN'
        ? 'bg-white/50 border-zafting-text/10'
        : 'bg-zafting-text/5 border-zafting-text/10';

    return (
      <div key={c.id} style={{ marginInlineStart: depth * 16 }}>
        <div className={`rounded-2xl border p-4 ${bg}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-sans text-sm font-medium text-zafting-text truncate">
                {authorLabel(c)}
              </p>
              <p className="font-sans text-xs text-zafting-text/50 mt-1">
                {formatDateTime(c.createdAt)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setReplyToId(c.id);
                setReplyMessage('');
              }}
              className="font-sans shrink-0 px-3 py-2 rounded-xl border border-zafting-text/20 hover:bg-zafting-text/5 transition-colors text-xs font-medium text-zafting-text"
            >
              {language === 'fa' ? 'پاسخ' : 'Reply'}
            </button>
          </div>
          <p className="font-sans text-sm text-zafting-text/80 mt-3 whitespace-pre-wrap leading-7">
            {c.message}
          </p>

          {replyToId === c.id ? (
            <div className="mt-4">
              <textarea
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder={language === 'fa' ? 'پاسخ شما...' : 'Your reply...'}
                className="w-full font-sans px-4 py-3 rounded-2xl border border-zafting-text/15 bg-white/60 outline-none focus:border-zafting-text/30 transition-colors min-h-[90px]"
              />
              <div className="flex gap-2 mt-3">
                <button
                  type="button"
                  onClick={async () => {
                    if (!order) return;
                    if (!replyMessage.trim()) return;
                    setCommentSaving(true);
                    try {
                      const created = await orderService.createComment({
                        orderCode: order.orderCode,
                        message: replyMessage.trim(),
                        parentId: c.id,
                      });
                      setOrder({ ...order, comments: [...comments, created] });
                      setReplyToId(null);
                      setReplyMessage('');
                    } finally {
                      setCommentSaving(false);
                    }
                  }}
                  disabled={commentSaving || !replyMessage.trim()}
                  className="font-sans px-4 py-2.5 rounded-xl bg-zafting-text text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {commentSaving
                    ? language === 'fa'
                      ? 'در حال ارسال...'
                      : 'Sending...'
                    : language === 'fa'
                      ? 'ارسال'
                      : 'Send'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setReplyToId(null);
                    setReplyMessage('');
                  }}
                  className="font-sans px-4 py-2.5 rounded-xl border border-zafting-text/20 hover:bg-zafting-text/5 text-sm font-medium text-zafting-text"
                >
                  {language === 'fa' ? 'انصراف' : 'Cancel'}
                </button>
              </div>
            </div>
          ) : null}
        </div>

        {replies.length ? (
          <div className="mt-3 space-y-3">
            {replies.map((r) => renderComment(r, depth + 1))}
          </div>
        ) : null}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="animate-fade-in">
        <DashboardPageHeader title={t('dashboard.orders.title')} />
        <DashboardCard>
          <div className="p-6">
            <p className="font-sans text-sm text-zafting-text/60">
              {language === 'fa' ? 'در حال دریافت سفارش...' : 'Loading order...'}
            </p>
          </div>
        </DashboardCard>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="animate-fade-in">
        <DashboardPageHeader title={t('dashboard.orders.title')} />
        <DashboardCard>
          <div className="p-6">
            <p className="font-sans text-sm text-zafting-text/60">
              {language === 'fa' ? 'سفارش یافت نشد.' : 'Order not found.'}
            </p>
            <Link
              to={`/${language}/dashboard/orders`}
              className="font-sans inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl border border-zafting-text/20 hover:bg-zafting-text/5 transition-colors"
            >
              {isRtl ? <ArrowRight size={18} /> : <ArrowLeft size={18} />}
              {language === 'fa' ? 'بازگشت' : 'Back'}
            </Link>
          </div>
        </DashboardCard>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <DashboardPageHeader title={t('dashboard.orders.title')} />

      <div className="space-y-6">
        <DashboardCard>
          <div className="p-6 flex items-start justify-between gap-4">
            <div>
              <p className="font-sans text-xs text-zafting-text/50">
                {t('dashboard.orders.orderCode')}
              </p>
              <p className="font-mono text-sm text-zafting-text dir-ltr mt-1">
                {order.orderCode}
              </p>
              <span
                className={`inline-flex mt-3 px-3 py-1 rounded-full text-xs font-sans border ${statusBadgeClass(order.orderStatus)}`}
              >
                {t(`order.orderStatus.${resolveOrderStatus(order)}`)}
              </span>
            </div>
            <Link
              to={`/${language}/dashboard/orders`}
              className="font-sans inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-zafting-text/20 hover:bg-zafting-text/5 transition-colors"
            >
              {isRtl ? <ArrowRight size={18} /> : <ArrowLeft size={18} />}
              {language === 'fa' ? 'بازگشت' : 'Back'}
            </Link>
          </div>
        </DashboardCard>

        <DashboardCard>
          <div className="p-6">
            <div className="flex items-center gap-2 text-zafting-text mb-4">
              <Package size={18} />
              <h2 className="font-serif text-lg font-semibold">
                {language === 'fa' ? 'اقلام سفارش' : 'Items'}
              </h2>
            </div>
            <div className="space-y-4">
              {order.items.map((it) => {
                const src = getImageUrl(it.imageUrl);
                return (
                  <div
                    key={it.id}
                    className="flex items-start justify-between gap-4 border border-zafting-text/10 bg-white/40 rounded-2xl p-4"
                  >
                    <div className="flex items-start gap-4 min-w-0">
                      {src ? (
                        <img
                          src={src}
                          alt={it.title}
                          className="w-16 h-20 object-cover rounded-xl border border-zafting-text/10 shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-20 rounded-xl bg-zafting-text/5 border border-zafting-text/10 shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="font-sans text-sm text-zafting-text truncate">
                          {it.title}
                        </p>
                        <p className="font-mono text-xs text-zafting-text/50 dir-ltr truncate mt-1">
                          {it.sku}
                        </p>
                        <p className="font-sans text-xs text-zafting-text/60 mt-2">
                          {language === 'fa' ? 'تعداد' : 'Qty'}: {it.quantity}
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0 text-end">
                      <p className="font-sans text-xs text-zafting-text/50">
                        {language === 'fa' ? 'قیمت واحد' : 'Unit'}
                      </p>
                      <p className="font-sans text-sm text-zafting-text mt-1">
                        {formatPriceToman(it.unitDiscountPrice ?? it.unitPrice)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </DashboardCard>

        <DashboardCard>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-zafting-text/10 bg-white/40 p-4">
                <p className="font-sans text-xs text-zafting-text/50">
                  {language === 'fa' ? 'جمع کل' : 'Total'}
                </p>
                <p className="font-sans text-sm text-zafting-text mt-1">
                  {formatPriceToman(order.totalAmount)}
                </p>
                <p className="font-sans text-xs text-zafting-text/50 mt-3">
                  {language === 'fa' ? 'تخفیف' : 'Discount'}
                </p>
                <p className="font-sans text-sm text-zafting-text mt-1">
                  {formatPriceToman(order.discountAmount)}
                </p>
              </div>
              <div className="rounded-2xl border border-zafting-text/10 bg-white/40 p-4">
                <p className="font-sans text-xs text-zafting-text/50">
                  {language === 'fa' ? 'روش ارسال' : 'Shipping method'}
                </p>
                <p className="font-sans text-sm text-zafting-text mt-1">
                  {order.shippingMethodTitle || '—'}
                </p>
                <p className="font-sans text-xs text-zafting-text/50 mt-3">
                  {language === 'fa' ? 'هزینه ارسال' : 'Shipping'}
                </p>
                <p className="font-sans text-sm text-zafting-text mt-1">
                  {formatPriceToman(order.shippingCost)}
                </p>
                <p className="font-sans text-xs text-zafting-text/50 mt-3">
                  {language === 'fa' ? 'مبلغ قابل پرداخت' : 'Payable'}
                </p>
                <p className="font-sans text-sm font-medium text-zafting-text mt-1">
                  {formatPriceToman(order.payableAmount)}
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-zafting-text/10 bg-white/40 p-4">
              <p className="font-sans text-xs text-zafting-text/50">
                {language === 'fa' ? 'آدرس ارسال' : 'Shipping address'}
              </p>
              <p className="font-sans text-sm text-zafting-text/80 mt-2 leading-7">
                {addressText || '—'}
              </p>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard>
          <div className="p-6">
            <h2 className="font-serif text-lg font-semibold text-zafting-text">
              {language === 'fa' ? 'تراکنش‌ها' : 'Transactions'}
            </h2>
            <div className="mt-4 space-y-3">
              {order.payments.length ? (
                order.payments.map((p) => (
                  <div
                    key={p.id}
                    className="rounded-2xl border border-zafting-text/10 bg-white/40 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-sans text-sm text-zafting-text">
                          {p.provider} • {p.status}
                        </p>
                        <p className="font-sans text-xs text-zafting-text/50 mt-1">
                          {formatDateTime(p.createdAt)}
                        </p>
                      </div>
                      <div className="shrink-0 font-sans text-sm text-zafting-text">
                        {formatPriceToman(p.amount)}
                      </div>
                    </div>
                    {(p.authority || p.refId) ? (
                      <p className="font-mono text-xs text-zafting-text/50 dir-ltr break-all mt-3">
                        {p.authority ? `Authority: ${p.authority}` : null}
                        {p.authority && p.refId ? ' | ' : null}
                        {p.refId ? `RefId: ${p.refId}` : null}
                      </p>
                    ) : null}
                  </div>
                ))
              ) : (
                <p className="font-sans text-sm text-zafting-text/60">
                  {language === 'fa' ? 'تراکنشی ثبت نشده است.' : 'No transactions.'}
                </p>
              )}
            </div>
          </div>
        </DashboardCard>

        <DashboardCard>
          <div className="p-6">
            <h2 className="font-serif text-lg font-semibold text-zafting-text">
              {language === 'fa' ? 'گفتگو درباره سفارش' : 'Order conversation'}
            </h2>

            <div className="mt-4 rounded-2xl border border-zafting-text/10 bg-white/40 p-4">
              <p className="font-sans text-sm text-zafting-text/70 mb-2">
                {language === 'fa' ? 'پیام جدید' : 'New message'}
              </p>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={language === 'fa' ? 'پیام خود را بنویسید...' : 'Write your message...'}
                className="w-full font-sans px-4 py-3 rounded-2xl border border-zafting-text/15 bg-white/60 outline-none focus:border-zafting-text/30 transition-colors min-h-[110px]"
              />
              <div className="flex justify-end mt-3">
                <button
                  type="button"
                  onClick={async () => {
                    if (!newComment.trim()) return;
                    setCommentSaving(true);
                    try {
                      const created = await orderService.createComment({
                        orderCode: order.orderCode,
                        message: newComment.trim(),
                      });
                      setOrder({ ...order, comments: [...comments, created] });
                      setNewComment('');
                    } finally {
                      setCommentSaving(false);
                    }
                  }}
                  disabled={commentSaving || !newComment.trim()}
                  className="font-sans px-5 py-2.5 rounded-xl bg-zafting-text text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {commentSaving
                    ? language === 'fa'
                      ? 'در حال ارسال...'
                      : 'Sending...'
                    : language === 'fa'
                      ? 'ارسال پیام'
                      : 'Send'}
                </button>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {(commentsByParent.get(null) ?? []).length ? (
                (commentsByParent.get(null) ?? []).map((c) => renderComment(c, 0))
              ) : (
                <p className="font-sans text-sm text-zafting-text/60">
                  {language === 'fa' ? 'هنوز پیامی ثبت نشده است.' : 'No messages yet.'}
                </p>
              )}
            </div>
          </div>
        </DashboardCard>
      </div>
    </div>
  );
};

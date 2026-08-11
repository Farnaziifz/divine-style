import { Truck, CreditCard, Clock, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const ShippingAndPayment = () => {
  const { language } = useLanguage();
  const isFa = language === 'fa';

  return (
    <section className="bg-[#EDE8E2] px-4 pb-20 pt-24 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-8 font-serif text-4xl font-semibold tracking-tight text-zafting-text sm:text-5xl lg:text-6xl">
          {isFa ? 'روش‌های ارسال و پرداخت' : 'Shipping & Payment'}
        </h1>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          {/* Shipping */}
          <div className="border border-black/60 bg-[#EFEAE4] p-6 sm:p-8 lg:p-10">
            <div className="mb-6 flex items-center gap-3">
              <Truck size={28} className="text-black" strokeWidth={1.5} />
              <h2 className="font-serif text-2xl font-medium text-black sm:text-3xl">
                {isFa ? 'روش‌های ارسال' : 'Shipping Methods'}
              </h2>
            </div>

            <div className="space-y-5 text-black/80">
              <div className="border-b border-black/20 pb-4">
                <p className="text-lg font-medium text-black">
                  {isFa ? 'ارسال با تیپاکس' : 'Tipax Courier'}
                </p>
                <p className="mt-1 text-base leading-7">
                  {isFa
                    ? 'ارسال به سراسر کشور از طریق شرکت پیشتاز تیپاکس. هزینه ارسال ثابت و بر عهدهٔ مشتری است و در مرحلهٔ پرداخت به مبلغ سفارش اضافه می‌شود.'
                    : 'Nationwide delivery via Tipax courier. Shipping is a flat fee, charged to the customer and added to the order total at checkout.'}
                </p>
              </div>

              <div className="flex items-start gap-3">
                <Clock size={18} className="mt-1 shrink-0 text-black/70" />
                <p className="text-sm leading-6">
                  {isFa
                    ? 'زمان آماده‌سازی و ارسال سفارش معمولاً ۱ تا ۳ روز کاری است. زمان دقیق رسیدن مرسوله به مقصد به شعبهٔ تیپاکس شهر شما بستگی دارد.'
                    : 'Orders are typically prepared and dispatched within 1–3 business days. Final delivery time depends on the Tipax branch serving your city.'}
                </p>
              </div>

              <p className="text-sm leading-6">
                {isFa
                  ? 'پس از ارسال، کد رهگیری مرسوله برای پیگیری در پنل کاربری و از طریق پیامک در اختیار شما قرار می‌گیرد.'
                  : 'Once shipped, a tracking code is provided in your account and via SMS so you can follow the package.'}
              </p>
            </div>
          </div>

          {/* Payment */}
          <div className="border border-black/60 bg-[#EFEAE4] p-6 sm:p-8 lg:p-10">
            <div className="mb-6 flex items-center gap-3">
              <CreditCard size={28} className="text-black" strokeWidth={1.5} />
              <h2 className="font-serif text-2xl font-medium text-black sm:text-3xl">
                {isFa ? 'روش‌های پرداخت' : 'Payment Methods'}
              </h2>
            </div>

            <div className="space-y-5 text-black/80">
              <div className="border-b border-black/20 pb-4">
                <p className="text-lg font-medium text-black">
                  {isFa ? 'پرداخت آنلاین (درگاه زرین‌پال)' : 'Online Payment (ZarinPal Gateway)'}
                </p>
                <p className="mt-1 text-base leading-7">
                  {isFa
                    ? 'پرداخت مبلغ سفارش به‌صورت آنلاین و از طریق درگاه بانکی زرین‌پال انجام می‌شود. تمامی کارت‌های عضو شتاب پذیرفته می‌شوند.'
                    : 'Orders are paid online through the ZarinPal payment gateway. All Shetab-network bank cards are accepted.'}
                </p>
              </div>

              <div className="flex items-start gap-3">
                <ShieldCheck size={18} className="mt-1 shrink-0 text-black/70" />
                <p className="text-sm leading-6">
                  {isFa
                    ? 'اطلاعات کارت شما مستقیماً و به‌صورت امن در درگاه بانکی وارد می‌شود؛ دیواین استایل به اطلاعات کارت شما دسترسی و آن را ذخیره نمی‌کند.'
                    : "Your card details are entered directly and securely on the bank's gateway; Divine Style never accesses or stores them."}
                </p>
              </div>

              <p className="text-sm leading-6">
                {isFa
                  ? 'بعد از پرداخت موفق، سفارش شما ثبت و رسید خرید در پنل کاربری قابل مشاهده است. در صورت ناموفق بودن پرداخت، مبلغ طی حداکثر ۷۲ ساعت به‌صورت خودکار به حساب شما بازمی‌گردد.'
                  : 'After a successful payment your order is confirmed and the receipt appears in your account. If a payment fails, the amount is automatically refunded to your account within 72 hours.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

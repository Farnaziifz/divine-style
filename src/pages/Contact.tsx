import { useMemo, useState } from 'react';
import { Facebook, Instagram, Phone, MapPin, Mail, Twitter } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import contactImage from '../assets/images/contact-page/1.jpg';

const CONTACT_INFO = {
  phone: '+98 21 1234 5678',
  email: 'hello@divinestyle.com',
  addressFa: 'تهران، خیابان ولیعصر، مجتمع دیواین استایل',
  addressEn: 'Valiasr St, Tehran, Iran',
  instagram: 'https://instagram.com',
  twitter: 'https://x.com',
  facebook: 'https://facebook.com',
};

export const Contact = () => {
  const { language } = useLanguage();
  const isFa = language === 'fa';
  const assetBase = import.meta.env.BASE_URL || '/';

  const imageCandidates = useMemo(
    () => [
      contactImage,
      `${assetBase}assets/contact-page/contact.jpg`,
      `${assetBase}assets/contact-page/contact.png`,
      `${assetBase}assets/images/login-page/fashion.jpg`,
    ],
    [assetBase],
  );
  const [imageIndex, setImageIndex] = useState(0);

  return (
    <section className="bg-[#EDE8E2] px-4 pb-20 pt-24 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-8 font-serif text-4xl font-semibold tracking-tight text-zafting-text sm:text-5xl lg:text-6xl">
          {isFa ? 'تماس با ما' : 'Contact Us'}
        </h1>

        <div className="relative mt-4">
          <div className="grid min-h-[430px] grid-cols-1 gap-10 border border-black/60 bg-[#EFEAE4] p-6 sm:p-8 lg:grid-cols-2 lg:gap-14 lg:p-12">
            <div className="space-y-7">
              <div className="border-b border-black/70 pb-3">
                <p className="text-base text-black/70">{isFa ? 'شماره تلفن' : 'Phone'}</p>
                <a
                  href={`tel:${CONTACT_INFO.phone.replace(/\s+/g, '')}`}
                  className="mt-1 block text-2xl font-medium text-black hover:opacity-70 transition-opacity dir-ltr"
                >
                  {CONTACT_INFO.phone}
                </a>
              </div>

              <div className="border-b border-black/70 pb-3">
                <p className="text-base text-black/70">{isFa ? 'ایمیل' : 'E-mail'}</p>
                <a
                  href={`mailto:${CONTACT_INFO.email}`}
                  className="mt-1 block text-2xl font-medium text-black hover:opacity-70 transition-opacity"
                >
                  {CONTACT_INFO.email}
                </a>
              </div>

              <div className="border-b border-black/70 pb-3">
                <p className="text-base text-black/70">{isFa ? 'آدرس' : 'Address'}</p>
                <p className="mt-1 text-xl font-medium leading-8 text-black">
                  {isFa ? CONTACT_INFO.addressFa : CONTACT_INFO.addressEn}
                </p>
              </div>
            </div>

            <div className="flex flex-col justify-between">
              <div className="space-y-8">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-black/80">
                    <Phone size={18} />
                    <span className="text-sm">{isFa ? 'تماس مستقیم' : 'Direct Line'}</span>
                  </div>
                  <a
                    href={`tel:${CONTACT_INFO.phone.replace(/\s+/g, '')}`}
                    className="block text-3xl font-semibold text-black hover:opacity-70 transition-opacity dir-ltr"
                  >
                    {CONTACT_INFO.phone}
                  </a>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-black/80">
                    <MapPin size={18} />
                    <span className="text-sm">{isFa ? 'دفتر مرکزی' : 'Based in'}</span>
                  </div>
                  <p className="max-w-sm text-2xl font-medium leading-9 text-black">
                    {isFa ? CONTACT_INFO.addressFa : 'Tehran, Iran'}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-black/80">
                    <Mail size={18} />
                    <span className="text-sm">{isFa ? 'پشتیبانی' : 'Support'}</span>
                  </div>
                  <a
                    href={`mailto:${CONTACT_INFO.email}`}
                    className="block text-xl font-medium text-black hover:opacity-70 transition-opacity"
                  >
                    {CONTACT_INFO.email}
                  </a>
                </div>
              </div>

              <div className="mt-10 flex items-center gap-6">
                <a href={CONTACT_INFO.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className="text-black transition-opacity hover:opacity-60">
                  <Facebook size={24} />
                </a>
                <a href={CONTACT_INFO.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="text-black transition-opacity hover:opacity-60">
                  <Instagram size={24} />
                </a>
                <a href={CONTACT_INFO.twitter} target="_blank" rel="noreferrer" aria-label="Twitter" className="text-black transition-opacity hover:opacity-60">
                  <Twitter size={24} />
                </a>
              </div>
            </div>
          </div>

          <div className="mt-0 h-44 w-full bg-[#E9C7B1] sm:h-56 lg:-mt-16 lg:h-72 lg:w-[58%]">
            <img
              src={imageCandidates[imageIndex] || imageCandidates[imageCandidates.length - 1]}
              alt={isFa ? 'تماس با دیواین استایل' : 'Contact Divine Style'}
              className="h-full w-full object-cover object-center"
              onError={() => {
                setImageIndex((prev) =>
                  prev < imageCandidates.length - 1 ? prev + 1 : prev,
                );
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

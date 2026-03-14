import Link from "next/link";
import { Facebook, Twitter, Globe, Linkedin, Circle } from "lucide-react";

const usefulLinks = [
  { label: "About Us", href: "/about" },
  { label: "Our Packages", href: "/packages" },
  { label: "Services", href: "/services" },
  { label: "Our Projects", href: "/projects" },
  { label: "Sales and Hire", href: "/sales-hire" },
  { label: "Contact", href: "/contact" },
];

const openingHours = [
  "Monday - 9:00AM to 6:00PM",
  "Tuesday - 9:00AM to 6:00PM",
  "Wednesday - 9:00AM to 6:00PM",
  "Thursday - 9:00AM to 6:00PM",
  "Friday - 9:00AM to 6:00PM",
  "Saturday - 9:00AM to 6:00PM",
];

const contactItems = [
  { label: "Address", value: "67 York St Sydney" },
  { label: "Phone", value: "0410 886 899", href: "tel:0410886899" },
  { label: "Email", value: "info@tradecareplus.com.au", href: "mailto:info@tradecareplus.com.au" },
];

function FooterTitle({
  before,
  highlight,
}: {
  before: string;
  highlight: string;
}) {
  return (
    <div className="mb-[25px]">
      <h5 className="font-alt text-lg font-bold leading-[1.2] text-white">
        {before} <span className="text-[#FFC527]">{highlight}</span>
      </h5>
      <div className="mt-3 h-0.5 w-[50px] bg-red-600" />
    </div>
  );
}

export default function Footer() {
  return (
    <section className="w-full">
      
      {/* Main footer */}
      <section className="relative overflow-hidden bg-[#181818] px-4 sm:px-6 pt-[40px] sm:pt-[60px] xl:pt-[90px]">
        <div
          className="absolute inset-0 opacity-80"
          style={{
            backgroundImage:
              "url('https://wdtelethemes.wpengine.com/homefix-elementor/wp-content/uploads/sites/5/2023/11/footerbg.png')",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
          }}
        />

        <div className="relative mx-auto max-w-[1290px] px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 md:gap-x-[30px] xl:grid-cols-4">
            {/* About */}
            <div>
              <FooterTitle before="About Our" highlight="Global" />

              <p className="mb-6 text-sm leading-[1.72] text-white">
                We provide professional home maintenance services with a focus on quality and customer satisfaction. One call solves all your house problems.
              </p>

              
            </div>

            {/* Useful links */}
            <div>
              <FooterTitle before="Useful" highlight="Links" />

              <ul className="space-y-[10px]">
                {usefulLinks.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="font-['Poppins'] text-[15px] leading-[1.72] text-white transition hover:text-[#FFC527]"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Opening hours */}
            <div>
              <FooterTitle before="Opening" highlight="Hours" />

              <ul className="space-y-[10px]">
                {openingHours.map((item) => (
                  <li
                    key={item}
                    className="font-['Poppins'] text-sm leading-[1.72] text-white"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <FooterTitle before="Contact" highlight="Here" />

              <ul className="mb-5 space-y-[10px]">
                {contactItems.map((item) => (
                  <li
                    key={item.label}
                    className="font-['Poppins'] text-sm leading-[1.72] text-white"
                  >
                    {!item.href ? (
                      <span>{item.label}: {item.value}</span>
                    ) : (
                      <Link href={item.href} className="transition hover:text-[#FFC527]">
                        {item.label}: {item.value}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>

              <div className="flex items-center gap-[6px]">
                <Link
                  href="#"
                  className="flex h-10 w-10 items-center justify-center text-white transition hover:text-[#FFC527]"
                >
                  <Facebook size={16} />
                </Link>
                <Link
                  href="#"
                  className="flex h-10 w-10 items-center justify-center text-white transition hover:text-[#FFC527]"
                >
                  <Twitter size={16} />
                </Link>
                <Link
                  href="#"
                  className="flex h-10 w-10 items-center justify-center text-white transition hover:text-[#FFC527]"
                >
                  <Globe size={16} />
                </Link>
                <Link
                  href="#"
                  className="flex h-10 w-10 items-center justify-center text-white transition hover:text-[#FFC527]"
                >
                  <Linkedin size={16} />
                </Link>
              </div>
            </div>
          </div>
          
          <div className="flex flex-row items-center justify-center gap-4 lg:items-center xl:justify-center py-8">
            <img
              src="https://wdtelethemes.wpengine.com/homefix-elementor/wp-content/uploads/sites/5/2023/11/footer-payment-1.png"
              alt="Cards accepted"
              className="h-auto w-auto max-w-full h-[36px] sm:h-[50px] md:h-auto"
            />
            <img
              src="https://wdtelethemes.wpengine.com/homefix-elementor/wp-content/uploads/sites/5/2023/11/footer-payment-2.webp"
              alt="More payment options"
              className="h-auto w-auto max-w-full h-[36px] sm:h-[50px] md:h-auto"
            />
          </div>
        </div>
      </section>

      {/* Bottom bar */}
      <section className="bg-black px-4 py-4 sm:px-6">
        <div className="mx-auto max-w-[1290px]">
          <div className=" text-center">
            <div className="text-sm text-center leading-[1.72] text-white">
              © 2026 TradeCarePlus. All Rights Reserved.{" "}
              
            </div>

           
          </div>
        </div>
      </section>
    </section>
  );
}

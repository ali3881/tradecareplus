import { Quote, Wrench } from "lucide-react";

const testimonials = [
  {
    name: "Sheena",
    role: "Team Leader, Solibilis Technologies",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    title: "Graece Donan, Latine Voluptatem Vocant",
    content:
      "radeCarePlus transformed our office space completely. Their attention to detail and professionalism were outstanding. Highly recommended for any commercial renovation projects.",
    accent: "yellow",
  },
  {
    name: "Dania Rose",
    role: "CEO, Skyline Infrastructure",
    image: "https://randomuser.me/api/portraits/women/68.jpg",
    title: "Atqui reperies inquit, quidem pertinacem",
    content:
      "I was impressed by their quick response time and efficient service. They fixed our electrical issues in no time. Truly a reliable partner for all maintenance needs.",
    accent: "orange",
  },
  {
    name: "Christopher",
    role: "Co-Founder, Tech World Builders",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    title: "Sed venio ad crimen, saepius meaberrrae",
    content:
      "TradeCarePlus exceeded our expectations with their roofing services. The team was skilled, courteous, and completed the job on schedule. Our roof looks fantastic and we couldn't be happier.",
    accent: "yellow",
  },
];

export default function Testimonials() {
  return (
    <section
      id="testimonials"
      className="bg-black px-4 py-28 text-white"
    >
      <div className="max-w-[1290px] mx-auto px-6">
        <div className="mx-auto mb-16 max-w-[700px] text-center">
          <div className="relative mx-auto inline-block border border-[#e7c76a] px-10 pt-8 pb-6">
            <div className="absolute -top-6 left-1/2 flex h-8 w-8 -translate-x-1/2 items-center justify-center bg-black">
              <Quote className="h-5 w-5 text-yellow-400" strokeWidth={2.2} />
            </div>

            <h2 className="text-4xl font-alt font-extrabold uppercase leading-none tracking-tight text-white">
              Our Testimonials
            </h2>

            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-black w-max px-3">
              <span className="text-xs font-alt font-bold uppercase tracking-[2px] text-white">
                What Other Say
              </span>
            </div>
          </div>

          <p className="mx-auto mt-10 max-w-xl text-sm leading-6 text-white">
            We have a strong commitment to customer satisfaction and a proven track record of delivering quality work.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((item, index) => {
            const isOrange = item.accent === "orange";

            return (
              <div
                key={index}
                className={`relative border-4 rounded-md bg-[#efefef] px-6 pb-8 pt-7 text-center text-black shadow-sm ${
                  isOrange ? "border-[#f04e23]" : "border-[#f3bf21]"
                }`}
              >
                <div
                  className={`font-alt relative mx-auto mb-8 inline-block rounded-md px-5 py-4 ${
                    isOrange ? "bg-[#f04e23] text-white" : "bg-[#f3bf21] text-black"
                  }`}
                >
                  <h3 className="text-2xl font-extrabold">
                    {item.title}
                  </h3>

                  <span
                    className={`absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-l-[12px] border-r-[12px] border-t-[10px] border-l-transparent border-r-transparent ${
                      isOrange ? "border-t-[#f04e23]" : "border-t-[#f3bf21]"
                    }`}
                  />
                </div>

                <div className="relative mx-auto max-w-[280px]">
                  <div className="pointer-events-none absolute left-1/2 top-10 -translate-x-1/2 text-[120px] font-bold leading-none text-black/5">
                    ”
                  </div>

                  <p className="relative z-10 text-sm text-black leading-normal font-medium">
                    {item.content}
                  </p>
                </div>

                <img
                  src={item.image}
                  alt={item.name}
                  className={`mx-auto mt-8 h-[76px] w-[76px] rounded-full object-cover border-2 ${
                    isOrange ? "border-[#f04e23]" : "border-[#f3bf21]"
                  }`}
                />

                <h4 className="mt-4 text-lg font-alt font-medium leading-none">
                  {item.name}
                </h4>

                <div className="my-4 flex items-center justify-center gap-2">
                  <span
                    className={`h-[2px] w-[24px] ${
                      isOrange ? "bg-[#f04e23]" : "bg-[#f3bf21]"
                    }`}
                  />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#f04e23]" />
                  <span
                    className={`h-[2px] w-[24px] ${
                      isOrange ? "bg-[#f04e23]" : "bg-[#f3bf21]"
                    }`}
                  />
                </div>

                <p className="mx-auto max-w-[220px] text-sm leading-2 font-medium text-black/85">
                  {item.role}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

import { Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sheena",
    role: "Team Leader, Solibilis Technologies",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    content: "TradeCarePlus transformed our office space completely. Their attention to detail and professionalism were outstanding. Highly recommended for any commercial renovation projects."
  },
  {
    name: "Dania Rose",
    role: "CEO, Skyline Infrastructure",
    image: "https://randomuser.me/api/portraits/women/68.jpg",
    content: "I was impressed by their quick response time and efficient service. They fixed our electrical issues in no time. Truly a reliable partner for all maintenance needs."
  },
  {
    name: "Christopher",
    role: "Co-Founder, Tech World Builders",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    content: "The team at TradeCarePlus is exceptional. They handled our plumbing emergency with great care and expertise. I wouldn't hesitate to call them again for any future work."
  }
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-yellow-500 font-bold uppercase tracking-wider text-sm mb-2 block">
            Our Testimonials
          </span>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">What Others Say</h2>
          <div className="w-20 h-1 bg-yellow-500 mx-auto rounded"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-gray-50 p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow relative">
              <Quote className="text-yellow-500 w-10 h-10 absolute top-6 right-6 opacity-20" />
              <div className="flex items-center space-x-4 mb-6">
                <img 
                  src={testimonial.image} 
                  alt={testimonial.name} 
                  className="w-16 h-16 rounded-full object-cover border-2 border-yellow-500"
                />
                <div>
                  <h4 className="font-bold text-lg text-gray-900">{testimonial.name}</h4>
                  <p className="text-sm text-yellow-600">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-gray-600 italic leading-relaxed">
                "{testimonial.content}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

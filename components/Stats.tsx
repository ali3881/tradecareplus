import { Users, CheckCircle, Star, UserPlus } from "lucide-react";

const stats = [
  {
    icon: <Users size={40} className="text-white" />,
    value: "4126+",
    label: "Happy Clients"
  },
  {
    icon: <CheckCircle size={40} className="text-white" />,
    value: "250+",
    label: "Projects Completed"
  },
  {
    icon: <Star size={40} className="text-white" />,
    value: "4+",
    label: "Average Ratings"
  },
  {
    icon: <UserPlus size={40} className="text-white" />,
    value: "38+",
    label: "Qualified Staffs"
  }
];

export default function Stats() {
  return (
    <section className="bg-yellow-500 py-16 text-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {stats.map((stat, index) => (
            <div key={index} className="flex flex-col items-center space-y-4 group">
              <div className="bg-white/20 p-4 rounded-full group-hover:bg-white/30 transition-colors transform group-hover:scale-110 duration-300">
                {stat.icon}
              </div>
              <h3 className="text-4xl font-bold">{stat.value}</h3>
              <p className="text-lg font-medium opacity-90">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

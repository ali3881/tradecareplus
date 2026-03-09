export default function About() {
  return (
    <section className="relative overflow-hidden bg-yellow-400 px-4 py-[50px] sm:py-[60px] lg:py-[70px] xl:py-[80px] 2xl:py-[100px]">
      {/* Pattern Overlay */}
      <div
        className="absolute inset-0 bg-[url('https://wdtelethemes.wpengine.com/homefix-elementor/wp-content/uploads/sites/5/2023/11/intro-section-pattern.png')] bg-repeat opacity-100"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-[1280px]">
        <div className="flex flex-col items-center justify-center text-center">
          {/* Title */}
          <h2 className="mb-5 text-3xl sm:text-4xl font-semibold font-alt capitalize leading-tight">
            One Call Can Solve All Your House Problems
          </h2>

          {/* Phone Icon */}
          <div className="flex justify-center">
            <img
              src="https://wdtelethemes.wpengine.com/homefix-elementor/wp-content/uploads/sites/5/2023/11/telephone-150x150-1.png"
              alt="Telephone"
              className="h-auto w-[150px] max-w-[20%] min-w-[70px] sm:max-w-none"
            />
          </div>

          {/* Contact Number */}
          <h2
            className="
              my-8
              bg-[url('https://wdtelethemes.wpengine.com/homefix-elementor/wp-content/uploads/sites/5/2023/11/contact-no-1.jpg')]
              bg-no-repeat
              bg-clip-text text-transparent
              drop-shadow-[4px_4px_0px_rgba(0,0,0,0.25)]
              text-[36px] sm:text-[54px] md:text-[72px] lg:text-[88px] font-extrabold leading-none tracking-[1px] sm:tracking-[2px]
            "
          >
  0410 - 886 - 899
</h2>

          {/* Subtitle */}
          <h3 className="mb-5 text-2xl sm:text-3xl font-semibold font-alt">
            And, We Have More Options To Contact Us
          </h3>

          {/* Store Buttons */}
          <div className="flex w-full flex-col items-center justify-center gap-3 min-[481px]:w-auto min-[481px]:flex-row">
            <a
              href="https://www.apple.com/in/app-store/"
              target="_blank"
              rel="noopener noreferrer"
              className="transition duration-300 hover:-translate-y-1"
            >
              <img
                src="https://wdtelethemes.wpengine.com/homefix-elementor/wp-content/uploads/sites/5/2023/11/app_store_icon.png"
                alt="App Store"
                className="h-auto w-full max-w-[144px]"
              />
            </a>

            <a
              href="https://play.google.com/store/games?hl=en_IN&gl=US"
              target="_blank"
              rel="noopener noreferrer"
              className="transition duration-300 hover:-translate-y-1"
            >
              <img
                src="https://wdtelethemes.wpengine.com/homefix-elementor/wp-content/uploads/sites/5/2023/11/google_play_icon.png"
                alt="Google Play"
                className="h-auto w-full max-w-[152px]"
              />
            </a>
          </div>
        </div>
      </div>
    </section>
    // <section id="about" className="py-20 bg-white">
    //   <div className="container mx-auto px-4">
    //     <div className="flex flex-col lg:flex-row items-center gap-12">
    //       {/* Image Side */}
    //       <div className="w-full lg:w-1/2 relative">
    //         <div className="relative h-[400px] md:h-[500px] w-full rounded-lg overflow-hidden shadow-xl">
    //           <img 
    //             src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=2070&auto=format&fit=crop" 
    //             alt="Professional Worker" 
    //             className="object-cover w-full h-full"
    //           />
    //         </div>
    //         <div className="absolute -bottom-6 -right-6 bg-yellow-500 text-white p-8 rounded-lg hidden md:block">
    //           <div className="text-4xl font-bold mb-2">15+</div>
    //           <div className="text-sm font-medium uppercase tracking-wider">Years of<br/>Experience</div>
    //         </div>
    //       </div>

    //       {/* Content Side */}
    //       <div className="w-full lg:w-1/2">
    //         <span className="text-yellow-500 font-bold uppercase tracking-wider text-sm mb-2 block">
    //           About Company
    //         </span>
    //         <h2 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
    //           We Are Professional & Reliable Home Services
    //         </h2>
    //         <div className="w-20 h-1 bg-yellow-500 mb-8 rounded"></div>
            
    //         <p className="text-gray-600 mb-6 leading-relaxed">
    //           We provide top-notch home maintenance services to ensure your home is safe, comfortable, and beautiful. Our team of experts is dedicated to delivering quality workmanship and exceptional customer service.
    //         </p>
            
    //         <div className="space-y-4 mb-8">
    //           <div className="flex items-center gap-3">
    //             <CheckCircle className="text-yellow-500 flex-shrink-0" size={20} />
    //             <span className="text-gray-700 font-medium">Professional & Experienced Team</span>
    //           </div>
    //           <div className="flex items-center gap-3">
    //             <CheckCircle className="text-yellow-500 flex-shrink-0" size={20} />
    //             <span className="text-gray-700 font-medium">Quality Workmanship Guaranteed</span>
    //           </div>
    //           <div className="flex items-center gap-3">
    //             <CheckCircle className="text-yellow-500 flex-shrink-0" size={20} />
    //             <span className="text-gray-700 font-medium">Affordable & Transparent Pricing</span>
    //           </div>
    //         </div>

    //         <Link href="/services" className="bg-gray-900 hover:bg-yellow-500 text-white hover:text-black px-8 py-4 rounded font-bold transition-all transform hover:scale-105 inline-block">
    //           LEARN MORE
    //         </Link>
    //       </div>
    //     </div>
    //   </div>
    // </section>
  );
}

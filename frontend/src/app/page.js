import Video from "./components/video";
import Slide from "./components/slide";
import Lenis from "./components/lenis";
import { AnimatedTestimonials } from "./components/animated-testimonials";

import { ChevronDown } from "lucide-react";

export default function Home() {
  const testimonials = [
    {
      quote:
        "The attention to detail and innovative features have completely transformed our workflow. This is exactly what we've been looking for.",
      name: "Sarah Chen",
      designation: "Product Manager at TechFlow",
      src: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=3560&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      quote:
        "Implementation was seamless and the results exceeded our expectations. The platform's flexibility is remarkable.",
      name: "Michael Rodriguez",
      designation: "CTO at InnovateSphere",
      src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      quote:
        "This solution has significantly improved our team's productivity. The intuitive interface makes complex tasks simple.",
      name: "Emily Watson",
      designation: "Operations Director at CloudScale",
      src: "https://images.unsplash.com/photo-1623582854588-d60de57fa33f?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fA%3D%3D",
    },
    {
      quote:
        "Outstanding support and robust features. It's rare to find a product that delivers on all its promises.",
      name: "James Kim",
      designation: "Engineering Lead at DataPro",
      src: "https://images.unsplash.com/photo-1636041293178-808a6762ab39?q=80&w=3464&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fA%3D%3D",
    },
    {
      quote:
        "The scalability and performance have been game-changing for our organization. Highly recommend to any growing business.",
      name: "Lisa Thompson",
      designation: "VP of Technology at FutureNet",
      src: "https://images.unsplash.com/photo-1624561172888-ac93c696e10c?q=80&w=2592&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
  ];

  return (
    <Lenis>
      <Video>
        <main className="flex min-h-screen flex-col items-center justify-center p-8 md:p-24 gap-20 ">
          <Slide>
            <h1 className=" font-nf text-4xl md:text-9xl text-primary font-bold ">
              Lets Revolutionize Your Ad Creation
            </h1>
          </Slide>
          <Slide delay={0.5}>
            <div className="w-full flex flex-row items-end justify-end ">
              <p className="font-nf text-lg md:text-2xl text-muted-foreground max-w-[50ch]  text-right">
                Streamline your research process. Identify pain points, discover
                winning strategies, and craft ads that convert - all in one
                powerful tool
              </p>
            </div>
          </Slide>

          <Slide delay={1}>
            <a
              href="/login"
              className="w-full bg-secondary font-nf font-bold text-sm md:text-xl p-4 hover:bg-accent text-primary hover:text-background rounded-2xl text-center transition-all duration-150 ease-in-out"
            >
              Lets Get Shit Done!
            </a>
          </Slide>
          <Slide delay={1.5}>
            <a href="#marketers">
              <ChevronDown className="w-8 h-8 text-primary animate-bounce" />
            </a>
          </Slide>
        </main>{" "}
      </Video>
      <main
        className="flex min-h-screen flex-col items-center justify-around p-8 md:p-24 gap-20 bg-primary "
        id="marketers"
      >
        <Slide>
          <h1 className=" font-nf text-4xl md:text-9xl text-background font-bold ">
            Why Marketers Love ART Finder:
          </h1>
        </Slide>
        <div className="flex flex-row items-center justify-center gap-10 w-full">
          <Slide delay={0.3}>
            <div className="w-fit flex flex-col items-center justify-center border-4 border-background rounded-2xl p-5 bg-accent -rotate-12 ">
              <p className="font-geist text-lg md:text-2xl text-neutral-950 font-black max-w-[50ch] ">
                Comprehensive Research Automation
              </p>
              <p className="font-geist !text-sm md:text-2xl text-neutral-900 max-w-[50ch] text-center">
                Scrape forums, blogs, app reviews, and competitor content in
                seconds.
              </p>
            </div>
          </Slide>
          <Slide delay={0.5}>
            <div className="w-fit flex flex-col items-center justify-center border-4 border-background rounded-2xl p-5 bg-accent rotate-6 ">
              <p className="font-geist text-lg md:text-2xl text-neutral-950 font-black max-w-[50ch] ">
                Actionable Insights
              </p>
              <p className="font-geist !text-sm md:text-2xl text-neutral-900 max-w-[50ch] text-center">
                Discover user pain points, triggers, and effective ad strategies
                instantly.
              </p>
            </div>
          </Slide>
          <Slide delay={0.8}>
            <div className="w-fit flex flex-col items-center justify-center border-4 border-background rounded-2xl p-5 bg-accent -rotate-3 ">
              <p className="font-geist text-lg md:text-2xl text-neutral-950 font-black max-w-[50ch] ">
                Reference Dashboard
              </p>
              <p className="font-geist !text-sm md:text-2xl text-neutral-900 max-w-[50ch] text-center">
                Direct links to competitor ads, videos, and user reviews for
                inspiration.
              </p>
            </div>
          </Slide>
        </div>
      </main>{" "}
      <main className="flex min-h-screen flex-col items-center justify-center p-8 md:p-24 gap-20 bg-background ">
        <Slide>
          <h1 className=" font-nf text-4xl md:text-9xl text-primary font-bold ">
            What Our Users Are Saying
          </h1>{" "}
        </Slide>
        <AnimatedTestimonials testimonials={testimonials} />
      </main>
    </Lenis>
  );
}

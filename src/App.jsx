import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { VectrScene } from "./VectrScene.jsx";

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    number: "01",
    title: "Activation, simplified",
    copy:
      "One call triggers mobilization. Your requirements: craft, count, and start date route directly to our verified crews. No hand-offs. No escalations. Just boots on the ground in minutes.",
  },
  {
    number: "02",
    title: "Cleared to count",
    copy:
      "Our team handles all screening and verification before dispatch. Compliance, background, certifications, and fitness-for-duty — we enforce a zero-fail model to guarantee every worker clears the gate on Day 1.",
  },
  {
    number: "03",
    title: "Proven field match",
    copy:
      "We don't just provide available workers. We deploy proven crews. By filtering for past performance, role fit, and reliability, we deliver teams engineered for endurance — ensuring your project stays fully manned from first break to completion.",
  },
  {
    number: "04",
    title: "Seamless arrival",
    copy:
      'We manage the "last mile" of mobilization. Every crew arrives site-ready with finalized reporting details. With real-time arrival monitoring and active coordination, we ensure your shift starts on time, even when field conditions shift.',
  },
];

const benefits = [
  {
    label: "01",
    title: "Rapid Activation",
    copy: "One call activates a precisely matched workforce in hours, not weeks.",
  },
  {
    label: "02",
    title: "Rigorous Selection",
    copy: "Local, qualified craft is filtered for skill, reliability, and project fit.",
  },
  {
    label: "03",
    title: "Verified Before Arrival",
    copy: "Background, drug testing, and site credentials are cleared before dispatch.",
  },
  {
    label: "04",
    title: "Controlled Outcomes",
    copy: "Cost, compliance, and arrival details stay coordinated through every shift.",
  },
];

function Header() {
  return (
    <header className="site-header">
      <nav className="nav-group nav-left" aria-label="Company">
        <a href="#capabilities">Our industries</a>
        <a href="#process">Our mission</a>
      </nav>
      <a className="wordmark" href="#top" aria-label="Vectr home">
        VECTR
      </a>
      <nav className="nav-group nav-right" aria-label="Actions">
        <a className="pill pill-light" href="#capabilities">
          Apply
        </a>
        <a className="pill pill-dark" href="#process">
          Request crews
        </a>
      </nav>
    </header>
  );
}

function ProcessPanel({ activeStep }) {
  const active = steps[activeStep];

  return (
    <aside className="process-panel" aria-live="polite">
      <div className="process-list">
        {steps.map((step, index) => (
          <div
            className={`process-row ${index === activeStep ? "is-active" : ""}`}
            key={step.number}
          >
            <span className="process-number">{step.number}</span>
            <span className="process-title">{step.title}</span>
          </div>
        ))}
      </div>
      <div className="process-detail" key={active.number}>
        <div className="detail-line" />
        <p>{active.copy}</p>
      </div>
    </aside>
  );
}

export function App() {
  const journeyRef = useRef(null);
  const sceneRef = useRef(null);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const scene = sceneRef.current;
    const journey = journeyRef.current;
    if (!scene || !journey) return undefined;

    const updateStep = (progress) => {
      const normalized = Math.max(0, Math.min(0.999, (progress - 0.12) / 0.72));
      setActiveStep(Math.min(3, Math.floor(normalized * 4)));
    };

    const scroll = ScrollTrigger.create({
      trigger: journey,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.55,
      onUpdate: (self) => {
        scene.setProgress(self.progress);
        updateStep(self.progress);
        journey.style.setProperty("--journey-progress", self.progress);
      },
    });

    return () => scroll.kill();
  }, []);

  const scrollToJourney = () => {
    window.scrollTo({
      top: window.innerHeight * 0.9,
      behavior: "smooth",
    });
  };

  return (
    <main id="top">
      <Header />
      <section className="journey" id="process" ref={journeyRef}>
        <div className="journey-sticky">
          <VectrScene ref={sceneRef} />

          <div className="hero-copy">
            <h1>
              <span>The New Standard</span>
              <span>in Staffing</span>
            </h1>
            <p>
              <span>AI driven speed. Expert curation.</span>
              <span>We mobilize verified crews to protect your schedule and</span>
              <span>
                your bottom line in high-consequence environments.
              </span>
            </p>
          </div>

          <button className="scroll-cue" onClick={scrollToJourney}>
            <span>Scroll to discover our process</span>
            <span className="scroll-line">
              <i />
            </span>
          </button>

          <ProcessPanel activeStep={activeStep} />
          <div className="scroll-thumb" aria-hidden="true" />
        </div>
      </section>

      <section className="capabilities" id="capabilities">
        <p className="eyebrow">Operational staffing, rebuilt</p>
        <h2>
          Designed for today&apos;s operations,
          <br /> beyond legacy staffing workflows.
        </h2>
        <div className="benefit-grid">
          {benefits.map((benefit) => (
            <article key={benefit.label}>
              <span>{benefit.label}</span>
              <h3>{benefit.title}</h3>
              <p>{benefit.copy}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

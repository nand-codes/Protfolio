import { motion } from "framer-motion";
import { MapPin, Mail, Phone } from "lucide-react";
import { personalInfo } from "../data/resume";

export default function About() {
  return (
    <section id="about" className="section-padding relative">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-2">
            About <span className="gradient-text">Me</span>
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-full mb-12" />
        </motion.div>

        <div className="grid md:grid-cols-5 gap-10 items-start">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="md:col-span-2"
          >
            <div className="glass rounded-3xl p-8 glow">
              <div className="w-32 h-32 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center text-4xl font-bold text-white">
                NK
              </div>
              <div className="space-y-4 text-sm">
                <div className="flex items-center gap-3 text-slate-400">
                  <MapPin size={16} className="text-cyan-400 shrink-0" />
                  {personalInfo.location}
                </div>
                <div className="flex items-center gap-3 text-slate-400">
                  <Mail size={16} className="text-cyan-400 shrink-0" />
                  <a
                    href={`mailto:${personalInfo.email}`}
                    className="hover:text-cyan-400 transition-colors break-all"
                  >
                    {personalInfo.email}
                  </a>
                </div>
                <div className="flex items-center gap-3 text-slate-400">
                  <Phone size={16} className="text-cyan-400 shrink-0" />
                  {personalInfo.phone}
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="md:col-span-3"
          >
            <p className="text-lg text-slate-300 leading-relaxed mb-6">
              {personalInfo.profile}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Experience", value: "2+ Years" },
                { label: "Projects", value: "3+" },
                { label: "Certifications", value: "2" },
                { label: "Focus", value: "AI/ML" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="glass rounded-2xl p-4 text-center hover:bg-white/5 transition-colors"
                >
                  <p className="text-2xl font-bold gradient-text">{stat.value}</p>
                  <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

import { motion } from "framer-motion";
import { Briefcase } from "lucide-react";
import { experience } from "../data/resume";

export default function Experience() {
  return (
    <section id="experience" className="section-padding relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-500/5 to-transparent pointer-events-none" />

      <div className="max-w-6xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-2">
            Work <span className="gradient-text">Experience</span>
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-full mb-12" />
        </motion.div>

        <div className="relative">
          <div className="absolute left-6 md:left-8 top-0 bottom-0 w-px bg-gradient-to-b from-cyan-500 via-violet-500 to-transparent" />

          <div className="space-y-12">
            {experience.map((job, index) => (
              <motion.div
                key={job.company + job.role}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="relative pl-16 md:pl-20"
              >
                <div className="absolute left-3 md:left-5 top-2 w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center">
                  <Briefcase size={12} className="text-white" />
                </div>

                <div className="glass rounded-2xl p-6 md:p-8 hover:bg-white/5 transition-all group">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-white group-hover:text-cyan-400 transition-colors">
                        {job.role}
                      </h3>
                      <p className="text-violet-400 font-medium">{job.company}</p>
                    </div>
                    <span className="text-sm font-mono text-slate-500 bg-white/5 px-3 py-1 rounded-full w-fit">
                      {job.period}
                    </span>
                  </div>
                  <ul className="space-y-2">
                    {job.highlights.map((item) => (
                      <li
                        key={item}
                        className="text-slate-400 text-sm leading-relaxed flex gap-2"
                      >
                        <span className="text-cyan-400 mt-1.5 shrink-0">▸</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

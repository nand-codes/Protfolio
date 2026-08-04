import { motion } from "framer-motion";
import { projects } from "../data/resume";

export default function Projects() {
  return (
    <section id="projects" className="section-padding relative">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-2">
            Featured <span className="gradient-text">Projects</span>
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-full mb-12" />
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <motion.article
              key={project.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              whileHover={{ y: -8 }}
              className="glass rounded-2xl overflow-hidden group hover:glow transition-all duration-300"
            >
              <div
                className={`h-40 bg-gradient-to-br ${project.gradient} flex items-center justify-center relative overflow-hidden`}
              >
                <div className="absolute inset-0 opacity-30">
                  <div className="absolute top-4 left-4 w-20 h-20 border border-white/10 rounded-full" />
                  <div className="absolute bottom-4 right-4 w-32 h-32 border border-white/10 rounded-full" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 border border-white/20 rounded-lg rotate-45" />
                </div>
                <h3 className="text-3xl font-bold text-white/90 relative z-10">
                  {project.name}
                </h3>
              </div>

              <div className="p-6">
                <p className="text-sm text-violet-400 font-medium mb-2">
                  {project.subtitle}
                </p>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">
                  {project.description}
                </p>

                <ul className="space-y-1.5 mb-4">
                  {project.highlights.map((highlight) => (
                    <li
                      key={highlight}
                      className="text-xs text-slate-500 flex gap-2"
                    >
                      <span className="text-cyan-400">▸</span>
                      {highlight}
                    </li>
                  ))}
                </ul>

                <div className="flex flex-wrap gap-1.5">
                  {project.tech.map((t) => (
                    <span
                      key={t}
                      className="text-xs px-2 py-0.5 rounded-md bg-white/5 text-slate-400 font-mono"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

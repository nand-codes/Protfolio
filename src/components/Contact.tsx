import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { GitHubIcon, LinkedInIcon } from "./icons";
import { personalInfo } from "../data/resume";

export default function Contact() {
  return (
    <section id="contact" className="section-padding relative">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-2">
            Get In <span className="gradient-text">Touch</span>
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-full mx-auto mb-4" />
          <p className="text-slate-400 max-w-lg mx-auto">
            Interested in working together? Feel free to reach out — I'm always
            open to discussing new opportunities and projects.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass rounded-3xl p-8 md:p-12 glow max-w-2xl mx-auto"
        >
          <div className="grid sm:grid-cols-2 gap-6 mb-8">
            <a
              href={`mailto:${personalInfo.email}`}
              className="flex items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all group"
            >
              <Mail size={20} className="text-cyan-400" />
              <div>
                <p className="text-xs text-slate-500">Email</p>
                <p className="text-sm text-slate-300 group-hover:text-cyan-400 transition-colors break-all">
                  {personalInfo.email}
                </p>
              </div>
            </a>
            <a
              href={`tel:${personalInfo.phone.replace(/\s/g, "")}`}
              className="flex items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all group"
            >
              <Phone size={20} className="text-cyan-400" />
              <div>
                <p className="text-xs text-slate-500">Phone</p>
                <p className="text-sm text-slate-300 group-hover:text-cyan-400 transition-colors">
                  {personalInfo.phone}
                </p>
              </div>
            </a>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5">
              <MapPin size={20} className="text-cyan-400" />
              <div>
                <p className="text-xs text-slate-500">Location</p>
                <p className="text-sm text-slate-300">{personalInfo.location}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5">
              <div className="flex gap-3">
                <a
                  href={personalInfo.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all hover:scale-110"
                  aria-label="GitHub"
                >
                  <GitHubIcon size={18} className="text-slate-300" />
                </a>
                <a
                  href={personalInfo.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all hover:scale-110"
                  aria-label="LinkedIn"
                >
                  <LinkedInIcon size={18} className="text-slate-300" />
                </a>
              </div>
            </div>
          </div>

          <a
            href={`mailto:${personalInfo.email}?subject=Hello%20Nanda!`}
            className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-medium hover:opacity-90 transition-all hover:scale-[1.02]"
          >
            <Send size={18} />
            Send Me an Email
          </a>
        </motion.div>
      </div>
    </section>
  );
}

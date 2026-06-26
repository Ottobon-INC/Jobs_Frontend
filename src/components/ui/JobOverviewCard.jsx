import { MapPin, Clock3, GraduationCap, IndianRupee } from 'lucide-react';

const JobOverviewCard = ({
  overviewSentences = [],
  skills = [],
  location = 'Not Specified',
  experience = 'Not Specified',
  qualification = null,
  salary = null,
  workMode = 'Onsite',
}) => (
  <div className="w-full mb-12 p-6 md:p-10 rounded-2xl md:rounded-[32px] border border-zinc-100 bg-[#FAFAFA] relative overflow-hidden group hover:bg-white transition-all shadow-sm">
    <div className="flex items-center gap-2 mb-8 border-b border-zinc-200 pb-4 inline-flex w-full">
      <span className="text-sm font-bold uppercase tracking-widest text-zinc-900">Job description</span>
    </div>

    <div className="relative z-10 flex flex-col gap-8">
      <div className="p-6 rounded-[24px] border border-zinc-100 bg-white/80">
        <div className="flex flex-col gap-4 text-sm font-semibold text-zinc-900">
          <div className="flex items-center gap-3">
            <MapPin size={16} className="text-zinc-400" />
            <span className={(!location || location === 'Not Specified' || location === 'Not specified') ? "text-zinc-400" : ""}>
              {location || 'Not Specified'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Clock3 size={16} className="text-zinc-400" />
            <span className={(!experience || experience === 'Not Specified' || experience === 'Not specified') ? "text-zinc-400" : ""}>
              {experience || 'Not Specified'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <GraduationCap size={16} className="text-zinc-400" />
            <span className={(!qualification || qualification === 'Not specified') ? "text-zinc-400" : ""}>
              {qualification || 'Not specified'}
            </span>
          </div>
          {(salary && salary !== 'Not specified' && salary !== 'Not Specified') && (
            <div className="flex items-center gap-3">
              <IndianRupee size={16} className="text-zinc-400" />
              <span>{salary}</span>
            </div>
          )}
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${workMode === 'Remote' ? 'bg-sky-500' : workMode === 'Hybrid' ? 'bg-purple-500' : 'bg-emerald-500'}`} />
            <span className="font-bold text-zinc-900 uppercase text-[10px] tracking-widest">{workMode}</span>
          </div>
        </div>
      </div>

      {overviewSentences && overviewSentences.length > 0 && (
        <div className="pb-4">
          <h3 className="text-xl font-bold text-zinc-900 mb-4">Role Overview</h3>
          <ul className="grid gap-3">
            {overviewSentences.map((sentence, index) => (
              <li key={`overview-${index}`} className="flex items-start gap-3 text-sm text-zinc-600 font-medium leading-relaxed">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-zinc-900/40 shrink-0" />
                <span>{sentence}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <h3 className="text-xl font-bold text-zinc-900 mb-4">Key Skills</h3>
        {skills.length > 0 ? (
          <ul className="grid gap-3">
            {skills.map((skill, index) => (
              <li key={`${index}-${skill}`} className="flex items-start gap-3 text-sm text-zinc-600 font-medium">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-zinc-300 shrink-0" />
                <span>{skill}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-zinc-500 font-medium">Relevant skills will appear here once the job data is fully enriched.</p>
        )}
      </div>
    </div>
  </div>
);

export default JobOverviewCard;

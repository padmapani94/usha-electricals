import { Award, Target, Users, Eye } from "lucide-react";
import { brands, clients } from "@/lib/seed-data";

export const metadata = { title: "About Us | Usha Electricals Engineering Works" };

const workDone = [
  { name: "Suppling, erection, testing & Commissioning of Pole, LED Lighting at VNIT Campus, Nagpur", amount: "₹6,32,999", dept: "VNIT", year: "2022" },
  { name: "Electrical Wiring of quarters at Lalpeth Subarea", amount: "₹22,20,908", dept: "WCL", year: "2022" },
  { name: "House Wiring & Street Light Township – Ghonsa Opencast Mine", amount: "₹10,01,861", dept: "WCL", year: "2022" },
  { name: "Lighting Renovation at Wagon Tippler Tunnel, KTPS 3×660MW", amount: "₹6,62,452", dept: "MSPGCL", year: "2019" },
  { name: "Flood Light Fitting – GMCH Premises, Nagpur", amount: "₹4,08,035", dept: "PWD", year: "2020" },
  { name: "Street Light Arrangement – ESIS Hospital, Pachpauli, Nagpur", amount: "₹2,48,973", dept: "PWD", year: "2020" },
  { name: "12.5 Mtr Highmast – Vitthal Rakhmini Temple, Dhapewada", amount: "₹2,76,763", dept: "PWD", year: "2017" },
  { name: "Street Light Pole at Baiyachi Pahadi, Niharwani, Mouda", amount: "₹3,30,490", dept: "ZP Nagpur", year: "2019" },
  { name: "Street Light Pole at Ambadevi Devasthan, Thandipavani", amount: "₹3,25,279", dept: "ZP Nagpur", year: "2019" },
];

export default function AboutPage() {
  return (
    <div>
      <section className="bg-navy text-white">
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
          <div className="text-xs font-semibold uppercase tracking-widest text-brand-orange">About Us</div>
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold mt-2">Usha Electricals Engineering Works</h1>
          <p className="text-navy-100 mt-4 max-w-3xl">
            Founded in 2016, we set out to be a leading Electricals Work &amp; Automation firm serving Industries, Warehouses, Commercial spaces, Construction sites, Properties and Contracting Agencies. The Company holds an electrical license issued by the Industries &amp; Energy Department.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <span className="bg-white/10 px-3 py-1 rounded-full">M.L. No. 34090</span>
            <span className="bg-white/10 px-3 py-1 rounded-full">GSTIN 27BRGPD5535F1ZY</span>
            <span className="bg-white/10 px-3 py-1 rounded-full">Govt. Contractor</span>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-12 md:py-16 grid md:grid-cols-3 gap-6">
        <Block icon={<Target className="text-brand-orange" />} title="Our Mission">
          To deliver high-quality, affordable electrical &amp; automation solutions while building long-term relationships with clients, vendors and our team.
        </Block>
        <Block icon={<Eye className="text-brand-orange" />} title="Our Vision">
          A highly skilled team of electrical &amp; automation engineers and technicians, fully equipped with measurement and testing devices — ready for rapid customer service.
        </Block>
        <Block icon={<Users className="text-brand-orange" />} title="Our Values">
          Customer satisfaction first. Continuous improvement. Cost-effective service. Innovation in industrial &amp; commercial automation.
        </Block>
      </section>

      <section className="bg-slate-50 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-xs font-semibold uppercase tracking-widest text-brand-orange">Track record</div>
          <h2 className="text-2xl md:text-3xl font-bold text-navy mt-1">Selected Government Work Orders</h2>
          <div className="overflow-x-auto mt-6 card">
            <table className="w-full text-sm">
              <thead className="bg-navy text-white">
                <tr>
                  <th className="text-left p-3">Work Description</th>
                  <th className="text-left p-3">Department</th>
                  <th className="text-left p-3">Year</th>
                  <th className="text-right p-3">Order Value</th>
                </tr>
              </thead>
              <tbody>
                {workDone.map((w, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-3 text-slate-700">{w.name}</td>
                    <td className="p-3 text-navy font-semibold">{w.dept}</td>
                    <td className="p-3 text-slate-500">{w.year}</td>
                    <td className="p-3 text-right font-semibold text-brand-orange">{w.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-12 md:py-16">
        <div className="text-xs font-semibold uppercase tracking-widest text-brand-orange">Authorised Dealers</div>
        <h2 className="text-2xl font-bold text-navy mt-1 mb-6">Brands We Carry</h2>
        <div className="flex flex-wrap gap-2">
          {brands.map((b) => (
            <span key={b} className="px-3 py-1.5 bg-slate-100 rounded text-sm text-navy">{b}</span>
          ))}
        </div>

        <div className="text-xs font-semibold uppercase tracking-widest text-brand-orange mt-12">Esteemed Customers</div>
        <h2 className="text-2xl font-bold text-navy mt-1 mb-6">Trusted By</h2>
        <div className="flex flex-wrap gap-2">
          {clients.map((c) => (
            <span key={c} className="px-3 py-1.5 bg-navy-50 rounded text-sm text-navy font-semibold">{c}</span>
          ))}
        </div>
      </section>
    </div>
  );
}

function Block({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="card p-6">
      <div className="bg-brand-orange/10 rounded-md w-10 h-10 flex items-center justify-center mb-3">{icon}</div>
      <h3 className="font-bold text-navy text-lg">{title}</h3>
      <p className="text-slate-600 text-sm mt-2">{children}</p>
    </div>
  );
}

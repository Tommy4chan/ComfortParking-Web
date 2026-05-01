import { dashboard, login, register } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { motion } from 'motion/react';
import { ArrowRight, Box, Cpu, Grid, ShieldCheck } from 'lucide-react';

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage<SharedData>().props;

    const containerVars = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.2,
            },
        },
    };

    const itemVars = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 80, damping: 20 } },
    };

    return (
        <>
            <Head title="Admin Portal | ComfortParking">
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;700;900&family=JetBrains+Mono:wght@400;700&display=swap"
                    rel="stylesheet"
                />
            </Head>
            <div className="relative min-h-screen overflow-hidden bg-[#05050A] text-slate-200 selection:bg-indigo-500/30 font-['Outfit']">
                {/* Background effects */}
                <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center overflow-hidden">
                    <div className="absolute top-[20%] right-[10%] h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[120px]"></div>
                    <div className="absolute bottom-[10%] left-[20%] h-[400px] w-[400px] rounded-full bg-indigo-600/10 blur-[100px]"></div>
                    <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}></div>
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_10%,transparent_100%)]"></div>
                </div>

                <div className="relative z-10 flex min-h-screen flex-col px-6 py-8 sm:px-12 max-w-screen-2xl mx-auto">
                    <nav className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 shadow-[0_0_20px_rgba(99,102,241,0.4)]">
                                <Box className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-white">
                                Comfort<span className="text-indigo-400">Parking</span>
                            </span>
                        </div>

                        <div className="flex items-center gap-4">
                            <a
                                href="/api-docs"
                                className="hidden sm:flex text-sm font-medium tracking-wide text-slate-400 transition-colors hover:text-white mr-4"
                            >
                                API Docs
                            </a>
                            {auth.user ? (
                                <Link
                                    href={dashboard()}
                                    className="group relative overflow-hidden rounded-full bg-white/5 border border-white/10 px-6 py-2.5 text-sm font-medium tracking-wide text-white transition-all hover:bg-white/10 hover:border-white/20 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                                >
                                    <span className="relative z-10 flex items-center gap-2">
                                        Enter Dashboard <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </span>
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className="text-sm font-medium tracking-wide text-slate-400 transition-colors hover:text-white"
                                    >
                                        Log In
                                    </Link>
                                    {canRegister && (
                                        <Link
                                            href={register()}
                                            className="group relative overflow-hidden rounded-full bg-indigo-500 px-6 py-2.5 text-sm font-medium tracking-wide text-white transition-all hover:bg-indigo-400 hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]"
                                        >
                                            Register
                                        </Link>
                                    )}
                                </>
                            )}
                        </div>
                    </nav>

                    <main className="flex flex-1 flex-col items-center justify-center py-20 text-center">
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={containerVars}
                            className="flex max-w-4xl flex-col items-center gap-8"
                        >
                            <motion.div variants={itemVars} className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs sm:text-sm font-medium tracking-wide text-indigo-300 font-['JetBrains_Mono']">
                                System Status: Online v1.0.0
                            </motion.div>
                            
                            <motion.div variants={itemVars} className="relative mt-4">
                                <h1 className="text-5xl font-black leading-[1.1] tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-500 sm:text-7xl lg:text-8xl">
                                    Intelligent <br/>
                                    <span className="bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-500">Parking Nodes</span>
                                </h1>
                            </motion.div>

                            <motion.p variants={itemVars} className="max-w-2xl mt-4 text-base leading-relaxed text-slate-400 sm:text-lg lg:text-xl">
                                Advanced telemetry and management infrastructure for next-generation automated parking zones. Oversee devices, monitor image recognition nodes, and control access in real-time.
                            </motion.p>

                            <motion.div variants={itemVars} className="mt-12 grid w-full max-w-4xl grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-3">
                                {[
                                    { icon: <Cpu className="h-6 w-6 text-blue-400" />, title: 'Edge Processing', desc: 'Real-time image recognition & ANPR processing pipelines' },
                                    { icon: <Grid className="h-6 w-6 text-indigo-400" />, title: 'Zone Mapping', desc: 'Dynamic space allocation & load balancing architecture' },
                                    { icon: <ShieldCheck className="h-6 w-6 text-emerald-400" />, title: 'Secure Access', desc: 'Fortified administrative control protocols & telemetry' },
                                ].map((feature, i) => (
                                    <div key={i} className="group relative flex flex-col items-center gap-4 rounded-3xl border border-white/5 bg-white/[0.02] p-8 transition-all hover:bg-white/[0.04] hover:-translate-y-1 hover:border-white/10">
                                        <div className="rounded-full bg-white/5 p-4 ring-1 ring-white/10 group-hover:ring-white/30 transition-all group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                                            {feature.icon}
                                        </div>
                                        <h3 className="font-semibold text-white tracking-wide text-lg">{feature.title}</h3>
                                        <p className="text-sm text-slate-400 leading-relaxed">{feature.desc}</p>
                                    </div>
                                ))}
                            </motion.div>
                        </motion.div>
                    </main>

                    <footer className="flex flex-col sm:flex-row items-center justify-between border-t border-white/10 pt-8 pb-4 text-[11px] font-medium tracking-wider text-slate-500 font-['JetBrains_Mono'] uppercase gap-4">
                        <p>© {new Date().getFullYear()} ComfortParking Infrastructure</p>
                        <div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="text-emerald-400 tracking-widest">All Nodes Operational</span>
                        </div>
                    </footer>
                </div>
            </div>
        </>
    );
}

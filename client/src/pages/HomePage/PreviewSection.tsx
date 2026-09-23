import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@client/src/components/ui/button';

const previews = [
  {
    title: '实时画笔',
    desc: '每一次下笔都即时同步到所有伙伴的画布',
    gradient: 'from-orange-400 to-pink-400',
  },
  {
    title: '彩色世界',
    desc: '丰富配色任你选择，画作更加生动',
    gradient: 'from-violet-400 to-sky-400',
  },
  {
    title: '精选分享',
    desc: '把作品分享到涂鸦精选，收获点赞与评论',
    gradient: 'from-emerald-400 to-cyan-400',
  },
];

function PreviewSection() {
  return (
    <section className="bg-gradient-to-b from-background to-primary/5">
      <div className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-24 lg:px-16">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">创作预览</h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            简单三步，开启你的涂鸦之旅
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {previews.map((item, index) => (
            <div
              key={item.title}
              className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className={`bg-gradient-to-br ${item.gradient} relative flex aspect-[16/10] items-center justify-center`}>
                {/* 涂鸦装饰 */}
                <svg viewBox="0 0 200 120" className="absolute inset-0 h-full w-full opacity-60">
                  <g fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round">
                    <path d="M20 80 C 50 40, 80 100, 110 60 S 160 50, 180 80" />
                    <path d="M30 40 C 60 20, 90 60, 120 35" />
                    <circle cx="150" cy="30" r="12" fill="#fde68a" stroke="none" />
                  </g>
                </svg>
                <span className="relative rounded-full bg-white/20 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur">
                  0{index + 1}
                </span>
              </div>
              <div className="p-6">
                <h3 className="mb-2 text-lg font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Button asChild size="lg" className="rounded-full px-10">
            <Link to="/paint">
              加入创作
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export default PreviewSection;

import { Link } from 'react-router-dom';
import { Brush, Palette, Sparkles } from 'lucide-react';
import { Button } from '@client/src/components/ui/button';

function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/10 to-background" />
      <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-accent/20 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 md:grid-cols-2 md:px-10 md:py-28 lg:px-16">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4" />
            多人实时协作涂鸦
          </div>
          <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-6xl">
            与小伙伴们共度涂鸦娱乐，
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              大展宏涂
            </span>
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground md:text-lg">
            创建属于你们的绘画项目，邀请好友一起在同一个画布上尽情创作。
            画笔、橡皮、丰富的颜色，实时同步每一笔灵感。
          </p>
          <div className="flex flex-wrap gap-4">
            <Button asChild size="lg" className="rounded-full px-8">
              <Link to="/paint">
                <Brush className="mr-2 h-5 w-5" />
                立即开始涂鸦
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full px-8">
              <Link to="/gallery">逛逛精选作品</Link>
            </Button>
          </div>
        </div>

        {/* 封面大图 */}
        <div className="relative">
          <div className="overflow-hidden rounded-3xl border border-border shadow-xl">
            <img
              src="/client/src/pages/HomePage/assets/cover.png"
              alt="多人协作涂鸦画板"
              className="aspect-[4/3] w-full object-cover"
              onError={(e) => {
                const target = e.currentTarget;
                target.onerror = null;
                target.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
                  `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fb923c"/><stop offset="1" stop-color="#a855f7"/></linearGradient></defs><rect width="800" height="600" fill="url(#g)"/><g fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round"><path d="M120 380 C 220 200, 380 520, 500 300 S 700 220, 760 320"/><path d="M140 460 C 260 620, 420 260, 560 440 S 680 380, 720 440"/><circle cx="600" cy="160" r="48" fill="#fde68a"/><path d="M160 140 C 220 100, 300 180, 360 130" /></g><text x="400" y="540" text-anchor="middle" font-size="40" font-family="sans-serif" fill="#fff" font-weight="bold">大展宏涂</text></svg>`
                );
              }}
            />
          </div>
          <div className="absolute -bottom-6 -left-6 flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-lg">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/15 text-accent">
              <Palette className="h-6 w-6" />
            </span>
            <div>
              <div className="text-sm font-semibold">实时协作</div>
              <div className="text-xs text-muted-foreground">每一笔都同步</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;

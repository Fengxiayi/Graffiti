import { Users, Palette, ShieldCheck, ImageIcon } from 'lucide-react';

const features = [
  {
    icon: Users,
    title: '多人协作',
    desc: '创建项目邀请好友，多人在同一画布上实时涂鸦，共同完成一幅作品。',
  },
  {
    icon: Palette,
    title: '丰富画笔',
    desc: '多种颜色、粗细可调，画笔与橡皮自由切换，满足不同创作需求。',
  },
  {
    icon: ShieldCheck,
    title: '权限清晰',
    desc: '每人只能编辑自己的笔迹，管理员可管理内容，创作更安心。',
  },
  {
    icon: ImageIcon,
    title: '涂鸦精选',
    desc: '把得意的画布截图分享到精选，点赞评论，和更多小伙伴交流创意。',
  },
];

function FeaturesSection() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-24 lg:px-16">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">功能一览</h2>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          从一块空白画布开始，和朋友们一起创造属于你们的涂鸦世界
        </p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
          >
            <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <feature.icon className="h-6 w-6" />
            </span>
            <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
            <p className="text-sm leading-6 text-muted-foreground">{feature.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default FeaturesSection;

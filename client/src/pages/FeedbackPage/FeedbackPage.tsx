import { useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@client/src/components/ui/button';
import { Textarea } from '@client/src/components/ui/textarea';
import { Input } from '@client/src/components/ui/input';
import { useAuthActions } from '@lark-apaas/client-toolkit/hooks/useAuthActions';
import { createFeedback } from '@client/src/api/feedback';

function FeedbackPage() {
  const { isLogin, goLogin } = useAuthActions();
  const [content, setContent] = useState('');
  const [contact, setContact] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!isLogin) {
      goLogin();
      return;
    }
    if (!content.trim()) {
      toast.error('请输入反馈内容');
      return;
    }
    setSubmitting(true);
    try {
      await createFeedback({
        content: content.trim(),
        contact: contact.trim() || undefined,
      });
      toast.success('反馈已提交，感谢你的建议！');
      setContent('');
      setContact('');
    } catch {
      toast.error('提交失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-14 md:px-10 lg:px-16">
      <div className="mb-10 text-center">
        <span className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <MessageSquare className="h-8 w-8" />
        </span>
        <h1 className="text-3xl font-bold tracking-tight">网站反馈</h1>
        <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
          遇到问题或有任何建议？告诉我们，我们会认真阅读每一条反馈，让大展宏涂变得更好
        </p>
      </div>

      <div className="space-y-5 rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="feedback-content">
            反馈内容
          </label>
          <Textarea
            id="feedback-content"
            placeholder="描述你遇到的问题或建议…"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            maxLength={2000}
          />
          <p className="text-right text-xs text-muted-foreground">{content.length}/2000</p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="feedback-contact">
            联系方式（可选）
          </label>
          <Input
            id="feedback-contact"
            placeholder="邮箱或手机号，便于我们回复你"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            maxLength={200}
          />
        </div>
        <Button className="w-full rounded-full" size="lg" onClick={handleSubmit} disabled={submitting}>
          <Send className="mr-2 h-4 w-4" />
          {submitting ? '提交中…' : '提交反馈'}
        </Button>
      </div>
    </div>
  );
}

export default FeedbackPage;

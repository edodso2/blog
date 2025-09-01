import Chat from '@/components/Chat';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default async function Home() {
  return (
    <div>
      <main>
        <div className="flex p-6 gap-6 align-center justify-center">
          <Button id="example-button">Example Button</Button>
          <Card id="example-card" title="Example Card">
            <CardContent>Example card content</CardContent>
          </Card>
        </div>
        <Chat />
      </main>
    </div>
  );
}
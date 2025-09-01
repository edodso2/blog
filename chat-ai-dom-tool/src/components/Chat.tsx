'use client';

import { useState } from 'react';
import { ToolUIPart, UIDataTypes, UIMessage } from 'ai';
import { useChat } from '@ai-sdk/react';
import { useHighlight } from '@/components/HighlightProvider';
import { ChatTools } from '@/app/api/chat/tools';

export default function Chat() {
  const [input, setInput] = useState('');
  const { highlight } = useHighlight();
  const { messages, sendMessage } = useChat<
    UIMessage<unknown, UIDataTypes, ChatTools>
  >({
    onFinish: ({ message }) => {
      message.parts
        // Filter for tool parts that have completed execution
        ?.filter(
          (part): part is ToolUIPart<ChatTools> =>
            part.type.startsWith('tool-') &&
            'state' in part &&
            part.state === 'output-available'
        )
        // Execute any highight tool results
        .forEach((toolResult) => {
          if (toolResult.type === 'tool-highlight') {
            const highightResult = toolResult as Extract<
              ToolUIPart<ChatTools>,
              { type: 'tool-highlight' }
            >;
            if (highightResult.output) {
              highlight({
                element: highightResult.output.element,
                popover: {
                  title: `Here is the ${highightResult.output.element}`,
                },
              });
            }
          }
        });
    },
  });

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {messages.map((message) => (
        <div key={message.id} className="whitespace-pre-wrap">
          {message.role === 'user' ? 'User: ' : 'AI: '}
          {message.parts.map((part, i) => {
            switch (part.type) {
              case 'text':
                return <div key={`${message.id}-${i}`}>{part.text}</div>;
            }
          })}
        </div>
      ))}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage({ text: input });
          setInput('');
        }}
      >
        <input
          className="fixed dark:bg-zinc-900 bottom-0 w-full max-w-md p-2 mb-8 border border-zinc-300 dark:border-zinc-800 rounded shadow-xl"
          value={input}
          placeholder="Say something..."
          onChange={(e) => setInput(e.currentTarget.value)}
        />
      </form>
    </div>
  );
}

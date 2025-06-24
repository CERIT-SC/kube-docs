'use client';

import Script from 'next/script';
import RunLLMButton from '@/components/runllmbutton';
import { Callout } from 'fumadocs-ui/components/callout';

type RunLLMWidgetProps = {
  assistantId: string;
  name?: string;
};

export default function RunLLMWidget({ assistantId, name = 'AI Assistant' }: RunLLMWidgetProps) {
  return (
    <>
      <Script
        type="module"
        id="runllm-widget-script"
        src="https://widget.runllm.com"
        crossOrigin="anonymous"
        version="stable"
        runllm-keyboard-shortcut="Mod+j"
        runllm-name={name}
        runllm-assistant-id={assistantId}
        runllm-hide-trigger-button="true"
        runllm-disable-ask-a-person="true"
        async
      />

      <RunLLMButton />

      <Callout type="warn">
        This chat is provided by a third-party service. We do not guarantee its availability,
        functionality, or data privacy. Cookies are used to support chat features — by continuing to use the chat, you
        consent to their use. Use at your own discretion.
      </Callout>
    </>
  );
}


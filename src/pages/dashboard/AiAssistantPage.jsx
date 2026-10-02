import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import AssistantChatInterface from '../../components/dashboard/AssistantChatInterface';
import FarmContextPanel from '../../components/dashboard/FarmContextPanel';
import ChatHistorySidebar from '../../components/dashboard/ChatHistorySidebar';

import { getFarmerContext } from '../../services/farmerContextService';
import {
  getChatSessions,
  getActiveSessionId,
  createNewChatSession,
  switchChatSession
} from '../../services/aiAssistantService';
import { useLanguage } from '../../context/LanguageContext';

export const AiAssistantPage = () => {
  const { language, t } = useLanguage();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [farmerContext, setFarmerContext] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [activeMessages, setActiveMessages] = useState([]);

  const [mobileContextOpen, setMobileContextOpen] = useState(false);
  const [mobileHistoryOpen, setMobileHistoryOpen] = useState(false);

  useEffect(() => {
    const contextObj = getFarmerContext();
    setFarmerContext(contextObj);

    let allSessions = getChatSessions();
    let currentId = getActiveSessionId();

    if (allSessions.length === 0 || !currentId) {
      const newSess = createNewChatSession(language);
      allSessions = getChatSessions();
      currentId = newSess.id;
    }

    setSessions(allSessions);
    setActiveSessionId(currentId);

    const msgs = switchChatSession(currentId);
    setActiveMessages(msgs);
  }, []);

  const handleNewChat = () => {
    const newSess = createNewChatSession(language);
    const updatedSessions = getChatSessions();
    setSessions(updatedSessions);
    setActiveSessionId(newSess.id);
    setActiveMessages([]);
    setMobileHistoryOpen(false);
  };

  const handleSelectSession = (sessionId) => {
    const msgs = switchChatSession(sessionId);
    setActiveSessionId(sessionId);
    setActiveMessages(msgs);
    setMobileHistoryOpen(false);
  };

  if (!farmerContext) {
    return (
      <DashboardLayout>
        <div className="py-20 text-center text-earth-brown text-sm font-bold animate-pulse">
          🌿 Loading KisanGuard AI Assistant...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col font-sans w-full h-[calc(100vh-6.5rem)] overflow-hidden">
        
        {/* Full-Page Workspace Area (Chat Covers 100% Page) */}
        <div className="flex-1 w-full h-full min-h-0 relative">
          
          {/* Main Full-Width Chat Interface */}
          <AssistantChatInterface
            farmerContext={farmerContext}
            initialQuery={initialQuery}
            activeSessionId={activeSessionId}
            initialMessages={activeMessages}
            onSessionUpdated={() => {
              const updated = getChatSessions();
              setSessions(updated);
            }}
            onOpenMobileContext={() => setMobileContextOpen(true)}
            onOpenMobileHistory={() => setMobileHistoryOpen(true)}
          />

          {/* Right Chat History Slide-Out Drawer */}
          <ChatHistorySidebar
            sessions={sessions}
            activeSessionId={activeSessionId}
            onSelectSession={handleSelectSession}
            onNewChat={handleNewChat}
            isOpen={mobileHistoryOpen}
            onClose={() => setMobileHistoryOpen(false)}
          />

          {/* Right Farm Details Slide-Out Drawer */}
          <FarmContextPanel
            farmerContext={farmerContext}
            isOpen={mobileContextOpen}
            onClose={() => setMobileContextOpen(false)}
          />

        </div>

      </div>
    </DashboardLayout>
  );
};

export default AiAssistantPage;

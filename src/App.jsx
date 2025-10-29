import { useState, useEffect, useMemo } from 'react';
import { parseCSV } from './utils/csvParser';
import { analyzeDeck } from './utils/deckAnalyzer';
import { getDefaultCustomization } from './utils/customization';
import HomeTab from './components/tabs/HomeTab';
import MyDecksTab from './components/tabs/MyDecksTab';
import DeckViewTab from './components/tabs/DeckViewTab';
import ExportTab from './components/tabs/ExportTab';
import BalancingTab from './components/tabs/BalancingTab';
import TextTweaksTab from './components/tabs/TextTweaksTab';
import CreateDeckModal from './components/modals/CreateDeckModal';
import CustomizeModal from './components/modals/CustomizeModal';
import DeleteConfirmModal from './components/modals/DeleteConfirmModal';
import GameMode from './components/game/GameMode';

function App() {
  const [mode, setMode] = useState('tool'); // 'tool' or 'game'
  const [currentTab, setCurrentTab] = useState('home');
  const [decks, setDecks] = useState([]);
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deckToDelete, setDeckToDelete] = useState(null);

  const [newDeckName, setNewDeckName] = useState('');
  const [newDeckType, setNewDeckType] = useState('hero');
  const [uploadedCards, setUploadedCards] = useState([]);

  const [balanceDeck1, setBalanceDeck1] = useState(null);
  const [balanceDeck2, setBalanceDeck2] = useState(null);

  const [keywords, setKeywords] = useState([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [textSettings, setTextSettings] = useState({
    standardEffectSize: 11,
    minEffectSize: 6,
    cardNameSize: 11,
    typeLineSize: 6,
    costSize: 12
  });

  const [exportFilter, setExportFilter] = useState('all');
  const [easyPrintMode, setEasyPrintMode] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const savedDecks = localStorage.getItem('cardDecks');
    const savedKeywords = localStorage.getItem('cardKeywords');
    const savedTextSettings = localStorage.getItem('textSettings');

    if (savedDecks) setDecks(JSON.parse(savedDecks));
    if (savedKeywords) setKeywords(JSON.parse(savedKeywords));
    if (savedTextSettings) setTextSettings(JSON.parse(savedTextSettings));
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (decks.length > 0) {
      localStorage.setItem('cardDecks', JSON.stringify(decks));
    } else {
      localStorage.removeItem('cardDecks');
    }
  }, [decks]);

  useEffect(() => {
    localStorage.setItem('cardKeywords', JSON.stringify(keywords));
  }, [keywords]);

  useEffect(() => {
    localStorage.setItem('textSettings', JSON.stringify(textSettings));
  }, [textSettings]);

  // Memoized analyses
  const deck1Analysis = useMemo(() =>
    balanceDeck1 ? analyzeDeck(balanceDeck1, keywords) : null,
    [balanceDeck1, keywords]
  );

  const deck2Analysis = useMemo(() =>
    balanceDeck2 ? analyzeDeck(balanceDeck2, keywords) : null,
    [balanceDeck2, keywords]
  );

  // Filter cards for export based on State column
  const filteredExportCards = useMemo(() => {
    if (!selectedDeck || currentTab !== 'export') return [];

    if (exportFilter === 'all') return selectedDeck.cards;

    return selectedDeck.cards.filter(card => {
      const state = card.State || '';
      if (exportFilter === 'print-new') return state === 'Print New';
      if (exportFilter === 'updated') return state === 'Updated';
      return true;
    });
  }, [selectedDeck, exportFilter, currentTab]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const cards = await parseCSV(file);
        setUploadedCards(cards);
      } catch (error) {
        alert('Error parsing CSV: ' + error.message);
      }
    }
  };

  const saveDeck = () => {
    if (!newDeckName.trim()) return alert('Please enter a deck name');
    if (uploadedCards.length === 0) return alert('Please upload a CSV file');

    const newDeck = {
      id: Date.now(),
      name: newDeckName,
      type: newDeckType,
      cards: uploadedCards,
      customization: getDefaultCustomization(newDeckType),
      createdAt: new Date().toISOString()
    };

    setDecks([...decks, newDeck]);
    setShowCreateModal(false);
    setNewDeckName('');
    setUploadedCards([]);
    setCurrentTab('view');
  };

  const deleteDeck = (deckId) => {
    setDeckToDelete(deckId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (deckToDelete) {
      setDecks(decks.filter(d => d.id !== deckToDelete));
      setShowDeleteConfirm(false);
      setDeckToDelete(null);
    }
  };

  const downloadAsHTML = () => {
    if (!selectedDeck) return;

    const pageContent = document.querySelector('[data-export-content]');
    if (!pageContent) return alert('Content not ready. Please try again.');

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${selectedDeck.name} - Print Ready</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: white; }
    @page { size: A4; margin: 0; }
    @media print { .no-print { display: none !important; } }
  </style>
</head>
<body>
  ${pageContent.innerHTML}
  <div class="no-print" style="position: fixed; top: 20px; right: 20px; background: #000; color: #fff; padding: 20px; border: 2px solid #f59e0b; border-radius: 8px; font-family: Arial;">
    <p style="font-weight: bold; margin-bottom: 10px;">📄 Ready to Print!</p>
    <p style="font-size: 14px; margin-bottom: 10px;">Press <strong>Ctrl+P</strong> (or Cmd+P on Mac)</p>
    <p style="font-size: 14px;">Select "Save as PDF" as destination</p>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedDeck.name.replace(/[^a-z0-9]/gi, '_')}_printable.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const viewDeck = (deck) => {
    setSelectedDeck(deck);
    setCurrentTab('deck-view');
  };

  const exportDeck = (deck) => {
    setSelectedDeck(deck);
    setExportFilter('all');
    setEasyPrintMode(false);
    setCurrentTab('export');
  };

  const updateDeckCustomization = (updates) => {
    const updatedDeck = {
      ...selectedDeck,
      customization: { ...selectedDeck.customization, ...updates }
    };
    setSelectedDeck(updatedDeck);
    setDecks(decks.map(d => d.id === updatedDeck.id ? updatedDeck : d));
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
      setKeywords([...keywords, newKeyword.trim()]);
      setNewKeyword('');
    }
  };

  const removeKeyword = (keyword) => {
    setKeywords(keywords.filter(k => k !== keyword));
  };

  const updateTextSetting = (key, value) => {
    setTextSettings({ ...textSettings, [key]: parseInt(value) || 6 });
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="bg-zinc-950 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex items-center justify-between">
            <nav className="flex gap-1">
              {[
                ['home', 'HOME'],
                ['view', 'MY DECKS'],
                ['balancing', 'BALANCING'],
                ['text-tweaks', 'TEXT TWEAKS']
              ].map(([tab, label]) => (
                <button
                  key={tab}
                  onClick={() => setCurrentTab(tab)}
                  className={`px-6 py-4 font-bold transition border-b-2 ${
                    currentTab === tab || (tab === 'view' && ['deck-view', 'export'].includes(currentTab))
                      ? 'text-amber-500 border-amber-500 bg-zinc-900/50'
                      : 'text-zinc-500 border-transparent hover:text-zinc-300 hover:border-zinc-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </nav>

            <button
              onClick={() => setMode(mode === 'tool' ? 'game' : 'tool')}
              className="px-6 py-3 font-bold bg-amber-500 text-black rounded-lg hover:bg-amber-400 transition-all shadow-lg"
            >
              {mode === 'tool' ? '🎮 PLAY GAME' : '🔧 BACK TO TOOL'}
            </button>
          </div>
        </div>
      </div>

      {mode === 'tool' ? (
        <div className="max-w-7xl mx-auto p-8">
          {currentTab === 'home' && (
          <HomeTab
            onCreateDeck={() => setShowCreateModal(true)}
            onViewDecks={() => setCurrentTab('view')}
            deckCount={decks.length}
          />
        )}

        {currentTab === 'view' && (
          <MyDecksTab
            decks={decks}
            onCreateDeck={() => setShowCreateModal(true)}
            onViewDeck={viewDeck}
            onExportDeck={exportDeck}
            onDeleteDeck={deleteDeck}
          />
        )}

        {currentTab === 'deck-view' && selectedDeck && (
          <DeckViewTab
            deck={selectedDeck}
            textSettings={textSettings}
            keywords={keywords}
            onBack={() => setCurrentTab('view')}
            onCustomize={() => setShowCustomize(true)}
            onExport={() => exportDeck(selectedDeck)}
          />
        )}

        {currentTab === 'export' && selectedDeck && (
          <ExportTab
            deck={selectedDeck}
            filteredCards={filteredExportCards}
            textSettings={textSettings}
            keywords={keywords}
            exportFilter={exportFilter}
            setExportFilter={setExportFilter}
            easyPrintMode={easyPrintMode}
            setEasyPrintMode={setEasyPrintMode}
            onBack={() => setCurrentTab('deck-view')}
            onDownload={downloadAsHTML}
          />
        )}

        {currentTab === 'balancing' && (
          <BalancingTab
            decks={decks}
            balanceDeck1={balanceDeck1}
            balanceDeck2={balanceDeck2}
            setBalanceDeck1={setBalanceDeck1}
            setBalanceDeck2={setBalanceDeck2}
            deck1Analysis={deck1Analysis}
            deck2Analysis={deck2Analysis}
          />
        )}

        {currentTab === 'text-tweaks' && (
          <TextTweaksTab
            keywords={keywords}
            newKeyword={newKeyword}
            setNewKeyword={setNewKeyword}
            addKeyword={addKeyword}
            removeKeyword={removeKeyword}
            textSettings={textSettings}
            updateTextSetting={updateTextSetting}
          />
        )}
        </div>
      ) : (
        <GameMode decks={decks} />
      )}

      {/* MODALS */}
      {showCreateModal && (
        <CreateDeckModal
          newDeckName={newDeckName}
          setNewDeckName={setNewDeckName}
          newDeckType={newDeckType}
          setNewDeckType={setNewDeckType}
          uploadedCards={uploadedCards}
          onFileUpload={handleFileUpload}
          onSave={saveDeck}
          onClose={() => {
            setShowCreateModal(false);
            setNewDeckName('');
            setUploadedCards([]);
          }}
        />
      )}

      {showCustomize && selectedDeck && (
        <CustomizeModal
          deck={selectedDeck}
          onUpdateCustomization={updateDeckCustomization}
          onClose={() => setShowCustomize(false)}
        />
      )}

      {showDeleteConfirm && (
        <DeleteConfirmModal
          onConfirm={confirmDelete}
          onCancel={() => {
            setShowDeleteConfirm(false);
            setDeckToDelete(null);
          }}
        />
      )}
    </div>
  );
}

export default App;

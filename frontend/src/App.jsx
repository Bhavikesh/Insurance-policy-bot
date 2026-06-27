import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Header from './components/Header';
import DocumentList from './components/DocumentList';
import UploadForm from './components/UploadForm';
import QuestionForm from './components/QuestionForm';
import AnswerBox from './components/AnswerBox';
import { useQueryRun } from './hooks/useQuery';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function AppContent() {
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [showUpload, setShowUpload] = useState(false);

  const queryMutation = useQueryRun();

  const handleSelectDocument = (doc) => {
    setSelectedDocument(doc);
    // Clear previous answers when switching documents
    setAnswers([]);
    setQuestions([]);
  };

  const handleUploadSuccess = (doc) => {
    setSelectedDocument(doc);
    setShowUpload(false);
  };

  const handleSubmitQuestions = async (questionList) => {
    if (!selectedDocument) {
      alert('Please select a document first');
      return;
    }

    setQuestions(questionList);
    setAnswers([]);

    try {
      const result = await queryMutation.mutateAsync({
        document_id: selectedDocument.id,
        questions: questionList,
      });

      setAnswers(result.answers);
    } catch (error) {
      const errorMsg = error.response?.data?.detail || error.message;
      alert('Query failed: ' + errorMsg);
      console.error('Query error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Document Selection */}
          <div className="lg:col-span-1 space-y-6">
            {/* Toggle between Document List and Upload */}
            <div className="flex space-x-2 mb-4">
              <button
                onClick={() => setShowUpload(false)}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  !showUpload
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Select from Database
              </button>
              <button
                onClick={() => setShowUpload(true)}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  showUpload
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Upload Document
              </button>
            </div>

            {showUpload ? (
              <UploadForm onUploadSuccess={handleUploadSuccess} />
            ) : (
              <DocumentList
                selectedDocId={selectedDocument?.id}
                onSelectDocument={handleSelectDocument}
              />
            )}
          </div>

          {/* Middle Column - Question Form */}
          <div className="lg:col-span-2 space-y-6">
            <QuestionForm
              selectedDocument={selectedDocument}
              onSubmit={handleSubmitQuestions}
              isLoading={queryMutation.isPending}
            />

            {/* Right Column - Answers */}
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Answers
                </h2>
                {answers.length > 0 && (
                  <button
                    onClick={() => {
                      setAnswers([]);
                      setQuestions([]);
                    }}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Clear
                  </button>
                )}
              </div>

              <AnswerBox answers={answers} questions={questions} />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>Intelligent Document Processing System v1.0</p>
            <p className="mt-1">Powered by AI • Built with React & FastAPI</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;
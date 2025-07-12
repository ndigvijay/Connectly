import React, { useState } from 'react';
import { PersonalizedMessageRequest } from '../types';
import { apiService } from '../services/api';
import './MessageGenerator.css';

const MessageGenerator: React.FC = () => {
  const [formData, setFormData] = useState<PersonalizedMessageRequest>({
    name: '',
    job_title: '',
    company: '',
    location: '',
    summary: '',
  });

  const [generatedMessage, setGeneratedMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedMessage, setEditedMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  // Sample data for testing
  const sampleData: PersonalizedMessageRequest = {
    name: 'John Doe',
    job_title: 'Software Engineer',
    company: 'TechCorp',
    location: 'San Francisco, CA',
    summary: 'Experienced software engineer with 5+ years in AI and machine learning. Passionate about building scalable systems and leading cross-functional teams.',
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const handleLoadSample = () => {
    setFormData(sampleData);
    setError('');
  };

  const handleClearForm = () => {
    setFormData({
      name: '',
      job_title: '',
      company: '',
      location: '',
      summary: '',
    });
    setGeneratedMessage('');
    setError('');
  };

  const validateForm = (): boolean => {
    const requiredFields = ['name', 'job_title', 'company'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof PersonalizedMessageRequest].trim());
    
    if (missingFields.length > 0) {
      setError(`Please fill in all required fields: ${missingFields.join(', ').replace(/_/g, ' ')}`);
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const message = await apiService.generatePersonalizedMessage(formData);
      setGeneratedMessage(message);
    } catch (err) {
      console.error('Error generating message:', err);
      setError('Failed to generate message. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const showToastMessage = () => {
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedMessage);
      showToastMessage();
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = generatedMessage;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      showToastMessage();
    }
  };

  const handleEditMode = () => {
    setIsEditMode(true);
    setEditedMessage(generatedMessage);
  };

  const handleSaveEdit = () => {
    setGeneratedMessage(editedMessage);
    setIsEditMode(false);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditedMessage('');
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedMessage(e.target.value);
  };

  return (
    <div className="message-generator">
      {showToast && (
        <div className="toast">
          <div className="toast-content">
            <span className="toast-icon">✓</span>
            <span className="toast-message">Message copied to clipboard!</span>
          </div>
        </div>
      )}
      
      <div className="generator-header">
        <h2>LinkedIn Message Generator</h2>
        <p>Generate personalized LinkedIn outreach messages using AI</p>
      </div>

      <div className="generator-content">
        <div className="form-section">
          <div className="form-header">
            <h3>LinkedIn Profile Information</h3>
            <div className="form-actions">
              <button
                type="button"
                onClick={handleLoadSample}
                className="btn-sample"
              >
                Load Sample Data
              </button>
              <button
                type="button"
                onClick={handleClearForm}
                className="btn-clear"
              >
                Clear Form
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="job_title">Job Title *</label>
                <input
                  type="text"
                  id="job_title"
                  name="job_title"
                  value={formData.job_title}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="company">Company *</label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="location">Location</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="summary">Professional Summary</label>
              <textarea
                id="summary"
                name="summary"
                value={formData.summary}
                onChange={handleInputChange}
                rows={4}
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button
              type="submit"
              className="btn-generate"
              disabled={isLoading}
            >
              {isLoading ? 'Generating Message...' : 'Generate Message'}
            </button>
          </form>
        </div>

        <div className="message-section">
          <div className="message-header">
            <h3>Generated Message</h3>
            {generatedMessage && (
              <div className="message-actions">
                {isEditMode ? (
                  <>
                    <button
                      type="button"
                      onClick={handleSaveEdit}
                      className="btn-save"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="btn-cancel"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleEditMode}
                      className="btn-edit"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={copyToClipboard}
                      className="btn-copy"
                    >
                      Copy to Clipboard
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="message-output">
            {isLoading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Generating personalized message...</p>
              </div>
            ) : generatedMessage ? (
              <div className="generated-message">
                <textarea
                  value={isEditMode ? editedMessage : generatedMessage}
                  onChange={isEditMode ? handleMessageChange : undefined}
                  readOnly={!isEditMode}
                  rows={8}
                  className={`message-text ${isEditMode ? 'edit-mode' : ''}`}
                />
              </div>
            ) : (
              <div className="empty-state">
                <p>Fill in the profile information and click "Generate Message" to create a personalized LinkedIn outreach message.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageGenerator; 
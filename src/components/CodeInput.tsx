import React, { useState } from 'react';

interface CodeInputProps {
  onSubmit: (code: string) => void;
  error?: string;
}

const CodeInput: React.FC<CodeInputProps> = ({ onSubmit, error }) => {
  const [code, setCode] = useState<string>('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    onSubmit(code);
  };

  return (
    <div className="code-input main">
      <div className="background"></div>
      <div className="content">
        <div className='top-wrapper'>
          <h1 className='cookie-regular glow header'>Art Exhibition System</h1>
        </div>
        <div className='middle-wrapper'>
          <h2>Enter painting code:</h2>
          <input
            maxLength={6}
            type="text"
            value={code}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCode(e.target.value)}
          />
        </div>
        <div className='bottom-wrapper'>
        <button type="submit" className='text'>Submit</button>
        </div>
        {error && <p className='error' style={{ color: 'red' }}>Invalid code, please try again.</p>}
      </div>
    </div>
  );
};

export default CodeInput;

import React, { useState, useRef, useEffect } from 'react';
import { Upload, RefreshCw, Github, Pencil, Image as ImageIcon, Download, Trash2, Linkedin, Mail } from 'lucide-react';

function App() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<{ digit: number; confidence: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingMode, setDrawingMode] = useState<'upload' | 'draw'>('upload');
  const [error, setError] = useState<string | null>(null);
  const [tool, setTool] = useState<'pencil' | 'eraser'>('pencil');
  const [brushSize, setBrushSize] = useState(15);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = 280;
      canvas.height = 280;

      const context = canvas.getContext('2d');
      if (context) {
        context.fillStyle = '#ffffff'; // White background
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.strokeStyle = '#000000'; // Black drawing color
        context.lineWidth = brushSize;
        context.lineCap = 'round';
        contextRef.current = context;

        // Add grid overlay
        context.strokeStyle = '#e0e0e0'; // Light gray grid
        context.lineWidth = 1;
        for (let i = 0; i <= canvas.width; i += 28) {
          context.beginPath();
          context.moveTo(i, 0);
          context.lineTo(i, canvas.height);
          context.stroke();
          context.beginPath();
          context.moveTo(0, i);
          context.lineTo(canvas.width, i);
          context.stroke();
        }
      }
    }
  }, [brushSize]);

  const startDrawing = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const { offsetX, offsetY } = event.nativeEvent;
    contextRef.current?.beginPath();
    contextRef.current?.moveTo(offsetX, offsetY);
    contextRef.current!.strokeStyle = tool === 'pencil' ? '#000000' : '#ffffff'; // Black for pencil, white for eraser
    contextRef.current!.lineWidth = brushSize;
    setIsDrawing(true);
  };

  const draw = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = event.nativeEvent;
    contextRef.current?.lineTo(offsetX, offsetY);
    contextRef.current?.stroke();
  };

  const stopDrawing = () => {
    contextRef.current?.closePath();
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    if (contextRef.current && canvasRef.current) {
      contextRef.current.fillStyle = '#ffffff'; // Reset to white background
      contextRef.current.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    setPrediction(null);
    setError(null);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedImage(URL.createObjectURL(file));
    setPrediction(null);
    setError(null);
  };

  const handlePredict = async (imageSource: 'upload' | 'draw') => {
    setIsLoading(true);
    setPrediction(null);
    setError(null);

    try {
      let formData = new FormData();

      if (imageSource === 'upload' && selectedImage) {
        const response = await fetch(selectedImage);
        const blob = await response.blob();
        formData.append('image', blob, 'upload.png');
      } else if (imageSource === 'draw' && canvasRef.current) {
        const blob = await new Promise<Blob>((resolve) =>
          canvasRef.current!.toBlob((blob) => resolve(blob!), 'image/png')
        );
        formData.append('image', blob, 'drawing.png');
      }

      const response = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      if (result.error) {
        throw new Error(result.error);
      }

      setPrediction(result);
    } catch (error) {
      console.error('Error predicting digit:', error);
      setError('Failed to predict digit. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setPrediction(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const downloadDrawing = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = 'digit-drawing.png';
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
              AI Digit Recognition
            </h1>
            <p className="text-emerald-400 text-lg">
              Draw or upload a handwritten digit and watch AI predict it in real-time!
            </p>
          </div>

          {/* Ahmad Yasin's Profile */}
          <div className="flex items-center justify-center mb-8">
            <img
              src="\mnist_digit_classifier\src\AhmadYasin.jpg"
              alt="Ahmad Yasin"
              className="w-24 h-24 rounded-full border-4 border-emerald-500"
            />
            <div className="ml-4">
              <h2 className="text-2xl font-bold text-white">Ahmad Yasin</h2>
              <p className="text-gray-400">AI & Full-Stack Developer</p>
              <div className="flex space-x-4 mt-2">
                <a
                  href="https://github.com/AhmadYasin1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  <Github className="h-6 w-6" />
                </a>
                <a
                  href="https://linkedin.com/in/mian-ahmad-yasin"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  <Linkedin className="h-6 w-6" />
                </a>
                <a
                  href="mailto:ahmadyasin.info@gmail.com"
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  <Mail className="h-6 w-6" />
                </a>
              </div>
            </div>
          </div>

          {/* Mode Selection */}
          <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-700">
            <div className="flex gap-4 mb-8 justify-center">
              <button
                onClick={() => setDrawingMode('upload')}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg transition ${
                  drawingMode === 'upload'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                <ImageIcon size={20} />
                Upload Image
              </button>
              <button
                onClick={() => setDrawingMode('draw')}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg transition ${
                  drawingMode === 'draw'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                <Pencil size={20} />
                Draw Digit
              </button>
            </div>

            {/* Upload Section */}
            {drawingMode === 'upload' && (
              <div className="mb-8">
                <div className="flex flex-col items-center gap-4">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="flex items-center gap-2 bg-emerald-500 text-white px-6 py-3 rounded-lg hover:bg-emerald-600 transition cursor-pointer"
                  >
                    <Upload size={20} />
                    Choose Image
                  </label>

                  {selectedImage && (
                    <div className="mt-4 w-full">
                      <div className="relative">
                        <img
                          src={selectedImage}
                          alt="Preview"
                          className="w-full h-64 object-contain rounded-lg border-2 border-slate-600"
                        />
                        <button
                          onClick={handleReset}
                          className="absolute top-2 right-2 p-2 bg-slate-800 rounded-full shadow-lg hover:bg-slate-700 transition"
                        >
                          <RefreshCw size={20} className="text-slate-300" />
                        </button>
                      </div>
                      <button
                        onClick={() => handlePredict('upload')}
                        className="mt-4 w-full flex items-center justify-center gap-2 bg-emerald-500 text-white px-6 py-3 rounded-lg hover:bg-emerald-600 transition"
                      >
                        Predict Digit
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Drawing Section */}
            {drawingMode === 'draw' && (
              <div className="mb-8">
                <div className="relative">
                  <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    className="w-full h-64 rounded-lg border-2 border-slate-600 cursor-crosshair"
                    style={{ touchAction: 'none' }}
                  />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <button
                      onClick={clearCanvas}
                      className="p-2 bg-slate-800 rounded-full shadow-lg hover:bg-slate-700 transition"
                      title="Clear canvas"
                    >
                      <Trash2 size={20} className="text-slate-300" />
                    </button>
                    <button
                      onClick={downloadDrawing}
                      className="p-2 bg-slate-800 rounded-full shadow-lg hover:bg-slate-700 transition"
                      title="Download drawing"
                    >
                      <Download size={20} className="text-slate-300" />
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => handlePredict('draw')}
                  className="mt-4 w-full flex items-center justify-center gap-2 bg-emerald-500 text-white px-6 py-3 rounded-lg hover:bg-emerald-600 transition"
                >
                  Predict Digit
                </button>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
                <p className="text-slate-400 mt-2">Analyzing image...</p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="text-center p-6 bg-red-800 rounded-lg border border-red-700">
                <p className="text-red-200">{error}</p>
              </div>
            )}

            {/* Result Section */}
            {prediction && (
              <div className="text-center p-6 bg-slate-700 rounded-lg border border-slate-600">
                <h2 className="text-3xl font-bold text-white mb-2">
                  Predicted Digit: {prediction.digit}
                </h2>
                <div className="w-full bg-slate-600 rounded-full h-2.5 mb-2">
                  <div
                    className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${prediction.confidence}%` }}
                  ></div>
                </div>
                <p className="text-emerald-400">
                  Confidence: {prediction.confidence.toFixed(2)}%
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 pt-8 border-t border-slate-700">
            <p className="text-center text-gray-400 text-sm">
              © {new Date().getFullYear()} Ahmad Yasin. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

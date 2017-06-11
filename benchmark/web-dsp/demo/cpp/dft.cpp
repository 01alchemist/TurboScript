#include <iostream>
#include <math.h>
#include <limits>
#include <complex>
#include <vector>
#include <ctime>

#ifndef M_PI
#define M_PI 3.141592653589793115997963468544185161590576171875
#endif

#define t_SIZE 128


struct FourierTransform {
  int bufferSize;
  int sampleRate;
  int N;
  double bandWidth;
  double* spectrum;
  double* real;
  double* imag;

  int peakBand;
  double peak;

  double* sine;
  double* cosine;
  
  FourierTransform();

  FourierTransform(int bufSize, int sr=44100) {
    bufferSize = bufSize;
    sampleRate = sr;
    N = bufferSize / 2 * bufferSize;
    bandWidth = 2.0 / bufferSize * sampleRate / 2.0;
    peakBand = 0;
    peak = 0;
    spectrum = new double[bufferSize];
    real = new double[bufferSize];
    imag = new double[bufferSize];
    sine = new double[N];
    cosine = new double[N];
    createSinusoids(sine, cosine);
  };

  void createSinusoids(double* sinTable, double* cosTable);

  double findPeak(double* buf, int len);

  double getBandFrequency(int index);

  void calculateSpectrum();

};

double FourierTransform::findPeak(double* buf, int len) {
  double p = 0;
  for (int i = 0; i < len; ++i) {
    p = std::abs(buf[i]) > p ? std::abs(buf[i]) : p;
  }
  return p;
}

double FourierTransform::getBandFrequency(int index) {
  return bandWidth * index + bandWidth / 2.0;
}

void FourierTransform::calculateSpectrum() {
  // printf("\ncalculating spectrum ...");
  double bSi = 2.0 / bufferSize;
  double rVal, iVal, mag;
  const int N = bufferSize >> 1;

  for (int i = 0; i < N; ++i) {
    rVal = real[i];
    iVal = imag[i];
    mag = bSi * sqrt(rVal * rVal + iVal * iVal);

    if (mag > peak) {
      peakBand = i;
      peak = mag;
    }

    spectrum[i] = mag;
    double freq = (i * sampleRate / (2 * N));
    printf("\nindex: %d \tfreq: %f\tmag: %f", i, freq, mag);
  }
}

void FourierTransform::createSinusoids(double* sinTable, double* cosTable) {
  // printf("\ncreating sinusoids...");
  for (int i = 0; i < N; ++i) {
    sinTable[i] = sin((i / double(t_SIZE)) * 2 * M_PI);
    cosTable[i] = cos((i / double(t_SIZE)) * 2 * M_PI);
  }
}

struct DFT {
  FourierTransform* ft;
  
  DFT(int bufSize, int sr=44100) {
    ft = new FourierTransform(bufSize, sr);
    // forward(ft->sine, ft->bufferSize);
  };

  void forward(double* buf, int len);
};

void DFT::forward(double* buf, int len) {
  // printf("\ncomputing forward DFT ... ");
  double rVal = 0, iVal = 0;
  
  for (int k = 0; k < ft->bufferSize / 2; ++k) {
    rVal = 0.0;
    iVal = 0.0;

    for (int n = 0; n < len; ++n) {
      rVal += ft->cosine[k * n] * buf[n];
      iVal += ft->sine[k * n] * buf[n];
    }

    ft->real[k] = rVal;
    ft->imag[k] = iVal;
  }

  ft->calculateSpectrum();
}

struct FFT {
  FourierTransform* ft;
  int* reverseTable;
  int limit;
  int bit;

  FFT(int bufSize, int sr=44100) {
    ft = new FourierTransform(bufSize, sr);
    reverseTable = new int[bufSize];
    limit = 1;
    bit = bufSize >> 1;
    // printf("\nbit: %d", bit);
    
    while (limit < ft->bufferSize) {
      for (int i = 0; i < limit; ++i) {
        reverseTable[i + limit] = reverseTable[i] + bit;
      }

      limit = limit << 1;
      bit = bit >> 1;
    }
    for (int i = 0; i < ft->bufferSize; ++i) {
      ft->sine[i] = sin(-M_PI  / i);
      ft->cosine[i] = sin(-M_PI  / i);
    }
  }

  void forward(double* buf, int len);

};

void FFT::forward(double* buf, int len) {
  int k = floor(log(ft->bufferSize) / log(2));

  if (pow(2, k) != ft->bufferSize) printf("Buffer size must be a power of 2.");
  if (ft->bufferSize != len) printf("Buffer is not the same length as FFT size.");

  int halfSize = 1, off;
  double phaseShiftStepReal, phaseShiftStepImag, currentPhaseShiftReal, currentPhaseShiftImag;
  double tr, ti, tempReal;

  for (int i = 0; i < ft->bufferSize; ++i) {
    ft->real[i] = buf[reverseTable[i]];
    ft->imag[i] = 0;
  }

  while (halfSize < ft->bufferSize) {
    phaseShiftStepReal = ft->cosine[halfSize];
    phaseShiftStepImag = ft->sine[halfSize];

    currentPhaseShiftReal = 1;
    currentPhaseShiftImag = 0;

    for (int fftStep = 0; fftStep < halfSize; ++fftStep) {
      int i = fftStep;

      while (i < ft->bufferSize) {
        off = i + halfSize;
        tr = (currentPhaseShiftReal * ft->real[off]) - (currentPhaseShiftImag * ft->imag[off]);
        ti = (currentPhaseShiftReal * ft->real[off]) - (currentPhaseShiftImag * ft->imag[off]);

        ft->real[off] = ft->real[i] - tr;
        ft->imag[off] = ft->imag[i] - ti;
        ft->real[i] += tr;
        ft->imag[i] += ti;

        i += halfSize << 1;
      }

      tempReal = currentPhaseShiftReal;
      currentPhaseShiftReal = (tempReal * phaseShiftStepReal) - (currentPhaseShiftImag * phaseShiftStepImag);
      currentPhaseShiftImag = (tempReal * phaseShiftStepImag) - (currentPhaseShiftImag * phaseShiftStepReal);
    }

    halfSize = halfSize << 1;
  }

  ft->calculateSpectrum();
}





int main() {
  std::cout.precision(20);

  int freq = 5000;
  double audioBuf[t_SIZE];
  for (int i = 0; i < t_SIZE; ++i) {
      audioBuf[i] = sin((i / double(t_SIZE)) * 2 * M_PI * freq);
  }

  // FourierTransform myFT(t_SIZE);
  // myFT.createSinusoids(myFT.sine, myFT.cosine, t_SIZE);
  // printf("%f", myFT.bandWidth);
  // printf("\n%f", myFT.getBandFrequency(1));
  std::clock_t begin;
  std::clock_t end;
  double timer = 0;
  int N = 1;
  for (int i = 0; i < N; ++i) {
    begin = clock();
    DFT myDFT(t_SIZE);
    myDFT.forward(audioBuf, t_SIZE);
    end = clock();
    timer += double(end - begin) / CLOCKS_PER_SEC;
  }
  printf("\nTook %f seconds to compute", timer / N);

  for (int i = 0; i < N; ++i) {
    begin = clock();
    FFT myFFT(t_SIZE);
    myFFT.forward(audioBuf, t_SIZE);
    end = clock();
    timer += double(end - begin) / CLOCKS_PER_SEC;
  }
  printf("\nTook %f seconds to compute", timer / N);
  // printf("\n%f", myDFT.ft->bandWidth);
  // for (int i = 0; i < myDFT.ft->N; i++) {
  //   printf("\ncosine: %f sine: %f", myDFT.ft->cosine[i], myDFT.ft->sine[i]);
  // }


  return 0;
}

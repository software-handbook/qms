#pragma once

#include <locale>
#include <string>
#include <io.h>
#include "highgui.hpp"
#include "Constant.h"

using namespace cv;
using namespace std;

class MediaAnalyzer {
public:
	static string GetExtension(string strFilePath);

    static bool IsPicture(string strMediaPath);
    static bool IsVideo(string strMediaPath);
    static bool IsPicture(CString strMediaPath);
    static bool IsVideo(CString strMediaPath);

	
    static bool CaptureImage(VideoCapture &videoCapture, const double dMilisecond, Mat &frame);
	static bool CaptureImage(VideoCapture &videoCapture, const double dMilisecond, string strOutputPath);

	static bool CaptureImageAtFrame(VideoCapture &videoCapture, const int nFrameNo, string strOutputPath);
	static bool CaptureImageAtFrame(VideoCapture &videoCapture, const int nFrameNo, Mat &frame);

    static bool WriteImage(Mat &frame, string strOutputPath);
    static bool WriteImage(IplImage &frame, string strOutputPath);
    // static bool WriteImage(HBITMAP image, string strOutputPath);

    static HBITMAP ConvertIplImage2HBITMAP(IplImage* pImage);
};

/********************************************************************************
* @class MediaAnalyzer
* @description provides utilities to processing media such as: video, image
*   - Determime type of media by extension of file
*   - Capture frame of video by given number of frame
*   - Capture frame of video by time
*   - Save frame to file jpeg
* @solution using OpenCV-2.4.6
* @license BSD
* @copyright mks.com.vn
*********************************************************************************/

#include "StdAfx.h"
#include "MediaAnalyzer.h"

string MediaAnalyzer::GetExtension(string strFilePath) {
    size_t nLen = strFilePath.length();
    size_t nPos = nLen - 4; // extension: .xxx

    if (nPos <= 0) {
        return strFilePath;
    } else {
        return strFilePath.substr(nPos, 4);
    }
}

bool MediaAnalyzer::IsVideo(string strMediaPath) {
    const string VIDEO_EXTS[3] = { ".avi", ".mp4", ".wmv"};
    string ext = GetExtension(strMediaPath);

    size_t nLen = sizeof(VIDEO_EXTS) / sizeof(VIDEO_EXTS[0]);

    for (size_t i = 0; i < nLen; i++) {
        if (VIDEO_EXTS[i].compare(ext) == 0) {
            return TRUE;
        }
    }

    return FALSE;
}

bool MediaAnalyzer::IsPicture(string strMediaPath) {
    const string IMAGE_EXTS[2] = { ".jpg", ".png"};
    string ext = GetExtension(strMediaPath);

    size_t nLen = sizeof(IMAGE_EXTS) / sizeof(IMAGE_EXTS[0]);

    for (size_t i = 0; i < nLen; i++) {
        if (IMAGE_EXTS[i].compare(ext) == 0) {
            return TRUE;
        }
    }

    return FALSE;
}

bool MediaAnalyzer::IsVideo(CString strMediaPath) {
    bool bResult;
    string stdStrMediaPath = CW2A(strMediaPath);

    bResult = IsVideo(stdStrMediaPath);

    return bResult;
}

bool MediaAnalyzer::IsPicture(CString strMediaPath) {
    bool bResult;
    string stdStrMediaPath = CW2A(strMediaPath);

    bResult = IsPicture(stdStrMediaPath);

    return bResult;
}

bool MediaAnalyzer::WriteImage(Mat &frame, string strOutputPath) {
    vector<int> compression_params; //vector that stores the compression parameters of the image
    compression_params.push_back(CV_IMWRITE_JPEG_QUALITY); //specify the compression technique
    compression_params.push_back(98); //specify the compression quality

    bool bResult = imwrite(strOutputPath, frame, compression_params); // write the image to file

    return bResult;
}

bool MediaAnalyzer::WriteImage(IplImage &frame, string strOutputPath) {
    vector<int> compression_params; //vector that stores the compression parameters of the image
    compression_params.push_back(CV_IMWRITE_JPEG_QUALITY); //specify the compression technique
    compression_params.push_back(98); //specify the compression quality


    bool bResult = cvSaveImage(strOutputPath.c_str(), &frame); // write the image to file

    return bResult;
}


//bool MediaAnalyzer::WriteImage(HBITMAP hBmp, string strOutputPath) {
//    bool bResult = TRUE;
//
//    BITMAP bmp;
//    PBITMAPINFO pbmi;
//    WORD    cClrBits;
//
//    // Retrieve the bitmap color format, width, and height.
//    if (!GetObject(hBmp, sizeof(BITMAP), (LPSTR)&bmp)) {
//        return FALSE;
//    }
//
//    // Convert the color format to a count of bits.
//    cClrBits = (WORD)(bmp.bmPlanes * bmp.bmBitsPixel);
//    if (cClrBits == 1) {
//        cClrBits = 1;
//    } else if (cClrBits <= 4) {
//        cClrBits = 4;
//    } else if (cClrBits <= 8) {
//        cClrBits = 8;
//    } else if (cClrBits <= 16) {
//        cClrBits = 16;
//    } else if (cClrBits <= 24) {
//        cClrBits = 24;
//    } else { cClrBits = 32; }
//
//    // Allocate memory for the BITMAPINFO structure. (This structure
//    // contains a BITMAPINFOHEADER structure and an array of RGBQUAD
//    // data structures.)
//
//    if (cClrBits < 24) {
//        pbmi = (PBITMAPINFO) LocalAlloc(LPTR,
//                                        sizeof(BITMAPINFOHEADER) +
//                                        sizeof(RGBQUAD) * (1<< cClrBits));
//
//        // There is no RGBQUAD array for these formats: 24-bit-per-pixel or 32-bit-per-pixel
//
//    } else {
//        pbmi = (PBITMAPINFO) LocalAlloc(LPTR,
//                                        sizeof(BITMAPINFOHEADER));
//    }
//    // Initialize the fields in the BITMAPINFO structure.
//
//    pbmi->bmiHeader.biSize = sizeof(BITMAPINFOHEADER);
//    pbmi->bmiHeader.biWidth = bmp.bmWidth;
//    pbmi->bmiHeader.biHeight = bmp.bmHeight;
//    pbmi->bmiHeader.biPlanes = bmp.bmPlanes;
//    pbmi->bmiHeader.biBitCount = bmp.bmBitsPixel;
//    
//    if (cClrBits < 24) {
//        pbmi->bmiHeader.biClrUsed = (1<<cClrBits);
//    }
//
//    // If the bitmap is not compressed, set the BI_RGB flag.
//    pbmi->bmiHeader.biCompression = BI_RGB;
//
//    // Compute the number of bytes in the array of color
//    // indices and store the result in biSizeImage.
//    // The width must be DWORD aligned unless the bitmap is RLE
//    // compressed.
//    pbmi->bmiHeader.biSizeImage = ((pbmi->bmiHeader.biWidth * cClrBits +31) & ~31) /8
//                                  * pbmi->bmiHeader.biHeight;
//    // Set biClrImportant to 0, indicating that all of the
//    // device colors are important.
//    pbmi->bmiHeader.biClrImportant = 0;
//
//    // pbmi
//    // Write PBITMAPINFO , HBITMAP
//    HANDLE hf;                 // file handle
//    BITMAPFILEHEADER hdr;       // bitmap file-header
//    PBITMAPINFOHEADER pbih;     // bitmap info-header
//    LPBYTE lpBits;              // memory pointer
//    DWORD dwTotal;              // total count of bytes
//    DWORD cb;                   // incremental count of bytes
//    BYTE *hp;                   // byte pointer
//    DWORD dwTmp;
//
//    LPTSTR pszFile = new TCHAR[strOutputPath.size() + 1];
//
//    _tcscpy(pszFile, (wchar_t*) strOutputPath.c_str());
//
//    pbih = (PBITMAPINFOHEADER) pbmi;
//    lpBits = (LPBYTE) GlobalAlloc(GMEM_FIXED, pbih->biSizeImage);
//
//    if (!lpBits) {
//        // "GlobalAlloc"
//        return FALSE;
//    }
//
//    // Retrieve the color table (RGBQUAD array) and the bits
//    // (array of palette indices) from the DIB.
//    /*if (!GetDIBits(hDC, hBMP, 0, (WORD) pbih->biHeight, lpBits, pbi,
//        DIB_RGB_COLORS))
//    {
//        errhandler("GetDIBits", hwnd);
//    }*/
//
//    // Create the .BMP file.
//    hf = CreateFile(pszFile,
//                    GENERIC_READ | GENERIC_WRITE,
//                    (DWORD) 0,
//                    NULL,
//                    CREATE_ALWAYS,
//                    FILE_ATTRIBUTE_NORMAL,
//                    (HANDLE) NULL);
//    if (hf == INVALID_HANDLE_VALUE) {
//        // errhandler("CreateFile", hwnd);
//        return FALSE;
//    }
//
//    hdr.bfType = 0x4d42;        // 0x42 = "B" 0x4d = "M"
//    // Compute the size of the entire file.
//    hdr.bfSize = (DWORD) (sizeof(BITMAPFILEHEADER) +
//                          pbih->biSize + pbih->biClrUsed
//                          * sizeof(RGBQUAD) + pbih->biSizeImage);
//    hdr.bfReserved1 = 0;
//    hdr.bfReserved2 = 0;
//
//    // Compute the offset to the array of color indices.
//    hdr.bfOffBits = (DWORD) sizeof(BITMAPFILEHEADER) +
//                    pbih->biSize + pbih->biClrUsed
//                    * sizeof (RGBQUAD);
//
//    // Copy the BITMAPFILEHEADER into the .BMP file.
//    if (!WriteFile(hf, (LPVOID) &hdr, sizeof(BITMAPFILEHEADER),
//                   (LPDWORD) &dwTmp,  NULL)) {
//        // errhandler("WriteFile", hwnd);
//        return FALSE;
//    }
//
//    // Copy the BITMAPINFOHEADER and RGBQUAD array into the file.
//    if (!WriteFile(hf, (LPVOID) pbih, sizeof(BITMAPINFOHEADER)
//                   + pbih->biClrUsed * sizeof (RGBQUAD),
//                   (LPDWORD) &dwTmp, ( NULL))) {
//        // errhandler("WriteFile", hwnd);
//        return FALSE;
//    }
//
//    // Copy the array of color indices into the .BMP file.
//    dwTotal = cb = pbih->biSizeImage;
//    hp = lpBits;
//    if (!WriteFile(hf, (LPSTR) hp, (int) cb, (LPDWORD) &dwTmp,NULL)) {
//        //  errhandler("WriteFile", hwnd);
//        return FALSE;
//    }
//
//    // Close the .BMP file.
//    if (!CloseHandle(hf)) {
//        // errhandler("CloseHandle", hwnd);
//        return FALSE;
//    }
//
//    // Free memory.
//    GlobalFree((HGLOBAL)lpBits);
//
//    return bResult;
//}

/**
*/
bool MediaAnalyzer::CaptureImageAtFrame(VideoCapture &videoCapture, const int nFrameNo, string strOutputPath) {
    bool bResult = TRUE;
    Mat frame;

    if (videoCapture.isOpened() == FALSE) {
        return FALSE;
    }

    vector<int> compression_params; //vector that stores the compression parameters of the image
    compression_params.push_back(CV_IMWRITE_JPEG_QUALITY); //specify the compression technique
    compression_params.push_back(98); //specify the compression quality


    videoCapture.set(CV_CAP_PROP_POS_FRAMES, nFrameNo);
    videoCapture.read(frame);

    bResult = imwrite(strOutputPath, frame, compression_params); //write the image to file

    return bResult;
}

bool MediaAnalyzer::CaptureImageAtFrame(VideoCapture &videoCapture, const int nFrameNo, Mat &frame) {
    bool bResult = TRUE;

    if (videoCapture.isOpened() == FALSE) {
        return FALSE;
    }

    vector<int> compression_params; //vector that stores the compression parameters of the image
    compression_params.push_back(CV_IMWRITE_JPEG_QUALITY); //specify the compression technique
    compression_params.push_back(98); //specify the compression quality


    videoCapture.set(CV_CAP_PROP_POS_FRAMES, nFrameNo);
    bResult = videoCapture.read(frame);

    return bResult;
}

/**
*/
bool MediaAnalyzer::CaptureImage(VideoCapture &videoCapture, const double dMilisecond, string strOutputPath) {
    bool bResult = TRUE;
    Mat frame;

    if (!videoCapture.isOpened()) {
        return FALSE;
    } else {
        // No statement
    }

    vector<int> compression_params; //vector that stores the compression parameters of the image
    compression_params.push_back(CV_IMWRITE_JPEG_QUALITY); // specify the compression technique
    compression_params.push_back(98); //specify the compression quality


    videoCapture.set(CV_CAP_PROP_POS_MSEC, dMilisecond);
    videoCapture.read(frame);

    bResult = imwrite(strOutputPath, frame, compression_params); // write the image to file

    return bResult;
}

/**
* @param frame output
* @return
* TRUE
*
*/
bool MediaAnalyzer::CaptureImage(VideoCapture &videoCapture, const double dMilisecond, Mat &frame) {
    bool bResult = TRUE;

    vector<int> compression_params;							// vector that stores the compression parameters of the image
    compression_params.push_back(CV_IMWRITE_JPEG_QUALITY);  // specify the compression technique
    compression_params.push_back(98);						// specify the compression quality

    if (!videoCapture.isOpened()) {
        return FALSE;
    } else {
        // No statement
    }

    videoCapture.set(CV_CAP_PROP_POS_MSEC, dMilisecond);

    bResult = videoCapture.read(frame);

    return bResult;
}

/**
* Convert IplImage to BITMAP
*/
HBITMAP MediaAnalyzer::ConvertIplImage2HBITMAP(IplImage* pImage) {
    IplImage* image = (IplImage*)pImage;
    bool imgConverted = false;
    /*if(pImage->nChannels!=3)
    {
          IplImage* imageCh3 = cvCreateImage(cvGetSize(pImage),
                8, 3);
          if(pImage->nChannels==1)
                cvCvtColor(pImage, imageCh3, CV_GRAY2RGB);
          image = imageCh3;

          imgConverted = true;
    }*/

    int bpp = image->nChannels * 8;
    assert(image->width >= 0 && image->height >= 0 &&
           (bpp == 8 || bpp == 24 || bpp == 32));
    CvMat dst;
    void* dst_ptr = 0;
    HBITMAP hbmp = NULL;
    unsigned char buffer[sizeof(BITMAPINFO) + 255*sizeof(RGBQUAD)];
    BITMAPINFO* bmi = (BITMAPINFO*)buffer;
    BITMAPINFOHEADER* bmih = &(bmi->bmiHeader);

    ZeroMemory(bmih, sizeof(BITMAPINFOHEADER));
    bmih->biSize = sizeof(BITMAPINFOHEADER);
    bmih->biWidth = image->width;
    bmih->biHeight = image->origin ? abs(image->height) :
                     -abs(image->height);
    bmih->biPlanes = 1;
    bmih->biBitCount = bpp;
    bmih->biCompression = BI_RGB;

    if (bpp == 8) {
        RGBQUAD* palette = bmi->bmiColors;
        int i;
        for (i = 0; i < 256; i++) {
            palette[i].rgbRed = palette[i].rgbGreen = palette
                                [i].rgbBlue
                                = (BYTE)i;
            palette[i].rgbReserved = 0;
        }
    }

    hbmp = CreateDIBSection(NULL, bmi, DIB_RGB_COLORS, &dst_ptr, 0,
                            0);
    cvInitMatHeader(&dst, image->height, image->width, CV_8UC3,
                    dst_ptr, (image->width * image->nChannels + 3) & -4);
    cvConvertImage(image, &dst, image->origin ? CV_CVTIMG_FLIP : 0);

    if (imgConverted) {
        cvReleaseImage(&image);
    }

    return hbmp;
}
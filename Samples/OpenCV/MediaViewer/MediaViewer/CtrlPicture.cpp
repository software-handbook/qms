
#include "StdAfx.h"
#include "CtrlPicture.h"
#include <GdiPlus.h>
using namespace Gdiplus;

// Macro to release COM Components

#ifdef SAFE_RELEASE
#undef SAFE_RELEASE
#endif
#define SAFE_RELEASE(x) do {\
    if ((x) != NULL) {\
        while ((x)->Release() != 0) {;\
           (x) = NULL;\
		}\
    } else {\
	    /* No statement*/\
	}\
} while (0)

/**
* This function is constructor.
* <br/>
*/
CCtrlPicture::CCtrlPicture(void) : CStatic()
    , m_pStream(NULL)
    , m_bIsPicLoaded(FALSE)
    , m_gdiplusToken(0) {

    GdiplusStartupInput gdiplusStartupInput;
    GdiplusStartup(&m_gdiplusToken, &gdiplusStartupInput, NULL);

	// Initial member data
    m_bCreatedOffScreen = FALSE;
	m_pStream = NULL;
	m_pImage = NULL;
    // m_imgOffScreen.Create(IMAGE_WIDTH_CONTROL, IMAGE_HEIGHT_CONTROL, 32);
}

/**
* This function is destructor.
* <br/>
*/
CCtrlPicture::~CCtrlPicture(void) {
    // Tidy up
    FreeData();
    GdiplusShutdown(m_gdiplusToken);

	// Release image frame
	if (m_pImage != NULL) {
		cvReleaseImage(&m_pImage);
	}
}

/**
* This function load image from stream.
* <br/>
* @param piStream pointer to stream.
* @return TRUE when load success.
* @return FALSE when load fail.
*/
BOOL CCtrlPicture::LoadFromStream(IStream *piStream) {
    // Set success error state
    SetLastError(ERROR_SUCCESS);

    FreeData();

    // Check for validity of argument
    if (piStream == NULL) {
        SetLastError(ERROR_INVALID_ADDRESS);
        return FALSE;
    } else {
        // No statement
    }

    // Allocate stream
    DWORD dwResult = CreateStreamOnHGlobal(NULL, TRUE, &m_pStream);
    if (dwResult != S_OK) {
        SetLastError(dwResult);
        return FALSE;
    } else {
        // No statement
    }

    // Rewind the argument stream
    LARGE_INTEGER lInt;
    lInt.QuadPart = 0;
    piStream->Seek(lInt, STREAM_SEEK_SET, NULL);

    // Read the lenght of the argument stream
    STATSTG statSTG;
    dwResult = piStream->Stat(&statSTG, STATFLAG_DEFAULT);
    if (dwResult != S_OK) {
        SetLastError(dwResult);
        SAFE_RELEASE(m_pStream);
        return FALSE;
    } else {
        // No statement
    }

    // Copy the argument stream to the class stream
    piStream->CopyTo(m_pStream, statSTG.cbSize, NULL, NULL);

    // Mark as loaded
    m_bIsPicLoaded = TRUE;

    Invalidate();
    RedrawWindow();

    return TRUE;
}

/**
* This function load image from byte array.
* <br/>
* @param pData pointer to byte data.
* @param nSize length of data.
* @return TRUE when load success.
* @return FALSE when load fail.
*/
BOOL CCtrlPicture::LoadFromStream(const BYTE *pData, const size_t nSize) {
    // Set success error state
    SetLastError(ERROR_SUCCESS);
    FreeData();

    // Allocate stream
    DWORD dwResult = CreateStreamOnHGlobal(NULL, TRUE, &m_pStream);
    if (dwResult != S_OK) {
        SetLastError(dwResult);
        return FALSE;
    } else {
        // No statement
    }

    // Copy argument data to the stream
    dwResult = m_pStream->Write(pData, (ULONG) nSize, NULL);
    if (dwResult != S_OK) {
        SetLastError(dwResult);
        SAFE_RELEASE(m_pStream);
        return FALSE;
    } else {
        // No statement
    }

    // Mark as loaded
    m_bIsPicLoaded = TRUE;

    Invalidate();
    RedrawWindow();

    return TRUE;
}

/**
* This function load image from path of image.
* <br/>
* @param szFilePath path of image.
* @return TRUE when load success.
* @return FALSE when load fail.
*/
BOOL CCtrlPicture::LoadFromFile(const CString &szFilePath) {
    // Set success error state
    SetLastError(ERROR_SUCCESS);
    FreeData();

    // Allocate stream
    DWORD dwResult = CreateStreamOnHGlobal(NULL, TRUE, &m_pStream);
    if (dwResult != S_OK) {
        SetLastError(dwResult);
        return FALSE;
    } else {
        // No statement
    }

    // Open the specified file
    CFile cFile;
    CFileException cFileException;
    if (cFile.Open(szFilePath, CStdioFile::modeRead | CStdioFile::typeBinary, &cFileException) == FALSE) {
        SetLastError(cFileException.m_lOsError);
        SAFE_RELEASE(m_pStream);
        return FALSE;
    } else {
        // No statement
    }

    // Copy the specified file's content to the stream
    BYTE pBuffer[STREAM_IMAGE_BUFFER_SIZE] = { ZERO_VALUE_BYTE_ARRAY };
    UINT dwRead = cFile.Read(pBuffer, STREAM_IMAGE_BUFFER_SIZE);

    while (dwRead != NULL) {
        dwResult = m_pStream->Write(pBuffer, dwRead, NULL);
        if (dwResult != S_OK) {
            SetLastError(dwResult);
            SAFE_RELEASE(m_pStream);
            cFile.Close();
            return FALSE;
        } else {
            // No statement
        }

        dwRead = cFile.Read(pBuffer, STREAM_IMAGE_BUFFER_SIZE);
    }

    // Close the file
    cFile.Close();

    // Mark as Loaded
    m_bIsPicLoaded = TRUE;

    Invalidate();
    // RedrawWindow();

    return TRUE;
}

/**
* This function load image from path of image.
* <br/>
* @param szFilePath path of image.
* @return TRUE when load success.
* @return FALSE when load fail.
*/
BOOL CCtrlPicture::Load(const CString &szFilePath) {
    return LoadFromFile(szFilePath);
}

/**
* This function load image from stream.
* <br/>
* @param piStream pointer to stream.
* @return TRUE when load success.
* @return FALSE when load fail.
*/
BOOL CCtrlPicture::Load(IStream *piStream) {
    return LoadFromStream(piStream);
}

/**
* This function load image from byte array.
* <br/>
* @param pData pointer to byte data.
* @param nSize length of data.
* @return TRUE when load success.
* @return FALSE when load fail.
*/
BOOL CCtrlPicture::Load(const BYTE *pData, const size_t nSize) {
    return LoadFromStream(pData, nSize);
}

/**
* This function load image by OpenCV.
* <br/>
* @param frame Image frame
* @return TRUE when load success.
* @return FALSE when load fail.
* @output m_pImage
* @output m_nChannelNo
*/
/*
BOOL CCtrlPicture::Load(Mat &pFrame) {
	CvSize imageSize = cvSize(IMAGE_WIDTH, IMAGE_HEIGHT);

	m_nChannelNo = pFrame.channels();
	// m_pImage = cvCreateImage(imageSize, IPL_DEPTH_8U, m_nChannelNo);

	m_pImage = new IplImage(pFrame);
	//IplImage stubImage;
	//IplImage *dstImage;
 //   dstImage = cvGetImage(pFrame, &stubImage);
	   
	// Initialize the IPL image -actually not necessary

    //Grayscale
    if (m_pImage->nChannels == 1) {
        float dx = (m_pImage->width / 256.0f);

        for ( int w = 0; w < m_pImage->width; w++ )
            for (int h = 0; h < m_pImage->height; h++) {
                m_pImage->imageData[ m_pImage->height * w + h] = (char)(w / dx ); // Copy data to ipl
            }
    } else if(m_pImage->nChannels == 3) { //The image is RGB
        IplImage* Temp = cvCreateImage( imageSize, IPL_DEPTH_8U, 1 );

        int h,w;
        float dx = (Temp->width / 256.0f) ;

        for ( w = 0; w < Temp->width; w++ )
            for (h = 0; h < Temp->height; h++)
                Temp->imageData[ Temp->height * w + h] = (char)(w / dx ); // Copy data to ipl
        cvSetImageCOI( m_pImage, 1); //Choose the blue channel of interest
        cvCopy(Temp,m_pImage);

        for ( w = 0; w < Temp->width; w++ )
            for (h = 0; h < Temp->height; h++)
                Temp->imageData[ Temp->height * w + h] = (char)(255 - w / dx ); // Copy green data to ipl
        cvSetImageCOI( m_pImage, 2); //Choose the green channel of interest
        cvCopy(Temp, m_pImage);

        for ( w = 0; w < Temp->width; w++ )
            for (h = 0; h < Temp->height; h++)
                Temp->imageData[ Temp->height * w + h] = (char)(w / dx ); // Copy red data to ipl
        cvSetImageCOI(m_pImage, 3); //Choose the red channel of interest
        cvCopy(Temp, m_pImage);

        cvReleaseImage(&Temp);
    }


	Invalidate();

    return TRUE;
}
*/

/**
* Load image from objct IplImage of OpenCV
* @param pImage pointer to image
* @return TRUE
*/
BOOL CCtrlPicture::Load(IplImage *pImage) {
	m_pImage = pImage;

	// Set success error state
    SetLastError(ERROR_SUCCESS);
    FreeData();

	m_bIsPicLoaded = TRUE;

    // This statement wil invoke DrawItem(..)
	Invalidate();

    return TRUE;
}


/**
* This function create offscreen. Call this function before init image to control.
* <br/>
* @param nWidth width of image control.
* @param nHeight height of image control.
*/
void CCtrlPicture::CreateOffScreen(const int nWidth, const int nHeight) {
    BOOL bResult;
    
    if (m_bCreatedOffScreen == FALSE) {
        bResult = m_imgOffScreen.Create(nWidth, nHeight, 32);

        if (bResult != FALSE) {
            m_bCreatedOffScreen = TRUE;
        }
    }
}

/**
* This function release data.
* <br/>
*/
void CCtrlPicture::FreeData() {
    m_bIsPicLoaded = FALSE;
    SAFE_RELEASE(m_pStream);
}

/**
* This function is PreSubclassWindow.
* <br/>
*/
void CCtrlPicture::PreSubclassWindow() {
    CStatic::PreSubclassWindow();
    ModifyStyle(0, SS_OWNERDRAW);
}

/**
* This function draw item.
* <br/>
* @param lpDrawItemStruct struct of draw item
*/
void CCtrlPicture::DrawItem(LPDRAWITEMSTRUCT lpDrawItemStruct) {
    // Check if pic data is loaded
    if (m_bIsPicLoaded != FALSE) {
		if (m_pStream != NULL) {
			DrawStream(CDC::FromHandle(lpDrawItemStruct->hDC));
		} else if (m_pImage != NULL) {
			DrawFrame(CDC::FromHandle(lpDrawItemStruct->hDC));
		}
    } else {
        // No statement
    }
}

/**
* This function erase background.
* <br/>
* @param pDC pointer of CDC.
* @return TRUE when erase success.
* @return FALSE when erase fail.
*/
BOOL CCtrlPicture::OnEraseBkgnd(CDC *pDC) {
    if (m_bIsPicLoaded != FALSE) {
        // Get control measures
        RECT rc;
        this->GetClientRect(&rc);
        Graphics graphics(pDC->GetSafeHdc());
        LARGE_INTEGER liSeekPos;
        liSeekPos.QuadPart = 0;
        m_pStream->Seek(liSeekPos, STREAM_SEEK_SET, NULL);
        Image image(m_pStream);
        graphics.DrawImage(&image, (INT)rc.left, (INT)rc.top, (INT)(rc.right - rc.left), (INT)(rc.bottom - rc.top));
        return TRUE;
    } else {
        return CStatic::OnEraseBkgnd(pDC);
    }
}

/**
* This function draw image stream to buffer and transfer to screen.
* <br/>
* @param pScreenDC pointer of CDC.
*/
void CCtrlPicture::DrawStream(CDC *pScreenDC) {
    int nHeight;
    int nWidth;
    int nControlHeight;
    int nControlWidth;
    int nDrawHeight;
    int nDrawWidth;

    // Draw some thing to memory DC
    CDC* pDC = CDC::FromHandle(m_imgOffScreen.GetDC());


    // Clear the background with black color

    pDC->FillSolidRect(ZERO_X_POSITION, ZERO_Y_POSITION, m_imgOffScreen.GetWidth(), m_imgOffScreen.GetHeight(),
                       RGB(DEFAULT_RED_COLOR, DEFAULT_GREEN_COLOR, DEFAULT_BLUE_COLOR));
    // Release DC to fix memory leak
    m_imgOffScreen.ReleaseDC();
    Graphics graphics(m_imgOffScreen.GetDC());

    Image image(m_pStream);

    nHeight = image.GetHeight();
    nWidth = image.GetWidth();

    nControlWidth = m_imgOffScreen.GetWidth();
    nControlHeight = m_imgOffScreen.GetHeight();

    if (nControlWidth >= nControlHeight) {
        if (nHeight >= nWidth) {
            if (nHeight >= nControlHeight) {
                // Resize when control width >= image height >= control height >= image width
                nDrawHeight = nControlHeight;
                nDrawWidth = (int) (nWidth * ((double) nControlHeight / (double) nHeight));
            } else {
                // Resize when control width >= control height >= image width >= image height
                nDrawHeight = nHeight;
                nDrawWidth = nWidth;
            }
        } else {
            if (nWidth >= nControlWidth) {
                // Resize when control height >= image width >= control width >= image height
                nDrawWidth = nControlWidth;
                nDrawHeight = (int) (nHeight *  ((double)nControlWidth / (double) nWidth));
            } else {
                // Resize when control height >= control width >= image width >= image height
                nDrawWidth = nWidth;
                nDrawHeight = nHeight;
            }
        }
    } else {
        if (nHeight >= nWidth) {
            if (nWidth >= nControlWidth) {
                // Resize when control height >= image width >= control width >= image height
                nDrawWidth = nControlWidth;
                nDrawHeight = (int) (nHeight * ((double) nControlWidth / (double) nWidth));
            } else {
                // Resize when control height >= control width >= image width >= image height
                nDrawHeight = nHeight;
                nDrawWidth = nWidth;
            }
        } else {
            if (nWidth >= nControlWidth) {
                // Resize when control height >= image width >= control width >= image height
                nDrawWidth = nControlWidth;
                nDrawHeight = (int) (nHeight *  ((double)nControlWidth / (double) nWidth));
            } else {
                // Resize when control height >= control width >= image width >= image height
                nDrawWidth = nWidth;
                nDrawHeight = nHeight;
            }
        }
    }

    graphics.DrawImage(&image, ZERO_X_POSITION, ZERO_Y_POSITION, nDrawWidth, nDrawHeight);

    // Copy memory DC to screen
    m_imgOffScreen.BitBlt(pScreenDC->GetSafeHdc(), ZERO_X_POSITION, ZERO_Y_POSITION, nControlWidth,
                          nControlHeight, ZERO_X_POSITION, ZERO_Y_POSITION, SRCCOPY);
    // Release DC to fix memory leak
    m_imgOffScreen.ReleaseDC();
}

/**
* This function draw image frame to buffer and transfer to screen.
* <br/>
* @param pScreenDC pointer of CDC.
*/

void CCtrlPicture::DrawFrame(CDC *pScreenDC) {
	// Debug: Save m_pImage into file: OK
    // MediaAnalyzer::WriteImage(*m_pImage, "C:\\Test2.jpg");


    // Convert m_pImage to bitmap

    HBITMAP hBitmap = MediaAnalyzer::ConvertIplImage2HBITMAP(m_pImage);

    // Get Bitmap
	Bitmap destBitMap(hBitmap, (HPALETTE) NULL);

    // Prepare to draw bitmap
	int nControlWidth = m_imgOffScreen.GetWidth();
    int nControlHeight = m_imgOffScreen.GetHeight();

	int nDrawWidth = nControlWidth;
	int nDrawHeight = nControlHeight;

	Graphics graphics(m_imgOffScreen.GetDC());


	graphics.DrawImage(&destBitMap, ZERO_X_POSITION, ZERO_Y_POSITION, nDrawWidth, nDrawHeight);

    // Copy memory DC to screen
    m_imgOffScreen.BitBlt(pScreenDC->GetSafeHdc(), ZERO_X_POSITION, ZERO_Y_POSITION, nControlWidth,
                          nControlHeight, ZERO_X_POSITION, ZERO_Y_POSITION, SRCCOPY);
    // Release DC to fix memory leak
    m_imgOffScreen.ReleaseDC();
}


/*

void CCtrlPicture::DrawFrame(CDC *pScreenDC) {

	int nControlWidth = m_imgOffScreen.GetWidth();
    int nControlHeight = m_imgOffScreen.GetHeight();

	int nDrawWidth = nControlWidth;
	int nDrawHeight = nControlHeight;

	Graphics graphics(m_imgOffScreen.GetDC());


	
	BITMAPINFO* bmi;
    BITMAPINFOHEADER* bmih;
    RGBQUAD* palette;
    unsigned int buffer[sizeof(BITMAPINFOHEADER) + sizeof(RGBQUAD)*256];
	
	// This creates a IPL image and initializes the image data to a grayscale ramp function, black in top and white in bottom.
    //Initialize the BMP display buffer
    bmi = (BITMAPINFO*)buffer;
    bmih = &(bmi->bmiHeader);
    memset( bmih, 0, sizeof(*bmih));
    bmih->biSize = sizeof(BITMAPINFOHEADER);
    bmih->biWidth = IMAGE_WIDTH;
    bmih->biHeight = -IMAGE_HEIGHT;
    bmih->biPlanes = 1;
    bmih->biCompression = BI_RGB;
    bmih->biBitCount = 8 * m_nChannelNo;
    palette = bmi->bmiColors;
    if (m_nChannelNo == 1) {
        for( int i = 0; i < 256; i++ ) {
            palette[i].rgbBlue = palette[i].rgbGreen = palette[i].rgbRed = (BYTE)i;
            palette[i].rgbReserved = 0;
        }
    }

	int res = StretchDIBits(
                  m_imgOffScreen.GetDC(), //dc
                  0, //x dest
                  0, //y dest
                  int(IMAGE_WIDTH), //x dest dims
                  int(IMAGE_HEIGHT), //y dest dims
                  0, // src x
                  0, // src y
                  IMAGE_WIDTH, // src dims
                  IMAGE_HEIGHT, // src dims
                  m_pImage->imageData, // array of DIB bits
                  (BITMAPINFO*) bmi, // bitmap information
                  DIB_RGB_COLORS, // RGB or palette indexes
                  SRCCOPY); // raster operation code
	

    // graphics.DrawImage(&destBitMap, ZERO_X_POSITION, ZERO_Y_POSITION, nDrawWidth, nDrawHeight);

    // Copy memory DC to screen
    m_imgOffScreen.BitBlt(pScreenDC->GetSafeHdc(), ZERO_X_POSITION, ZERO_Y_POSITION, nControlWidth,
                          nControlHeight, ZERO_X_POSITION, ZERO_Y_POSITION, SRCCOPY);
    // Release DC to fix memory leak
    m_imgOffScreen.ReleaseDC();

    // Update Window, force View to redraw.
    RedrawWindow(
        NULL, // handle to window
        NULL, // update rectangle
        RDW_INVALIDATE // handle to update region
    );
}

*/
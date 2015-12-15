
// MediaViewerDlg.h : header file
//

#pragma once
#include "afxwin.h"
#include "ctrlpicture.h"
#include "MediaAnalyzer.h"


// CMediaViewerDlg dialog
class CMediaViewerDlg : public CDialogEx
{
// Construction
public:
	CMediaViewerDlg(CWnd* pParent = NULL);	// standard constructor

// Dialog Data
	enum { IDD = IDD_MEDIAVIEWER_DIALOG };

	protected:
	virtual void DoDataExchange(CDataExchange* pDX);	// DDX/DDV support


// Implementation
protected:
	HICON m_hIcon;

    // Handel of Control Image Viewer
    HWND m_hCtrlImageViewer;

	// Generated message map functions
	virtual BOOL OnInitDialog();
	afx_msg void OnSysCommand(UINT nID, LPARAM lParam);
	afx_msg void OnPaint();
	afx_msg HCURSOR OnQueryDragIcon();
	DECLARE_MESSAGE_MAP()
public:
    CEdit m_editFilePath;
    afx_msg void OnBnClickedButtonBrowse();
    afx_msg void OnBnClickedButtonShow();
    CCtrlPicture m_ctrlImageViewer;
    CStatic m_lblFrameNo;
    CEdit m_txtFrameNo;
    CButton m_chkVisible;
    afx_msg void OnBnClickedCheckVisible();

private:
    CRect m_rectImageViewer;
};

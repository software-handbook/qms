#pragma once

#include <cv.h>
#include <cxcore.h>
#include <highgui.h>



namespace TestDisplayFrame {

	using namespace System;
	using namespace System::ComponentModel;
	using namespace System::Collections;
	using namespace System::Windows::Forms;
	using namespace System::Data;
	using namespace System::Drawing;

	IplImage* frame = 0;
	CvCapture* capture = 0;
	int camBusy = 0;
	int camStatus = 0;

	/// <summary>
	/// Summary for Form1
	/// </summary>
	public ref class Form1 : public System::Windows::Forms::Form
	{
	public:
		Form1(void)
		{
			InitializeComponent();
			//
			//TODO: Add the constructor code here
			//
		}

	protected:
		/// <summary>
		/// Clean up any resources being used.
		/// </summary>
		~Form1()
		{
			if (components)
			{
				delete components;
			}
		}
	private: System::ComponentModel::BackgroundWorker^  backgroundWorker1;
	protected: 
	private: System::Windows::Forms::Button^  btnShow;
	private: System::Windows::Forms::PictureBox^  pictureBox1;

	private:
		/// <summary>
		/// Required designer variable.
		/// </summary>
		System::ComponentModel::Container ^components;

#pragma region Windows Form Designer generated code
		/// <summary>
		/// Required method for Designer support - do not modify
		/// the contents of this method with the code editor.
		/// </summary>
		void InitializeComponent(void)
		{
			this->backgroundWorker1 = (gcnew System::ComponentModel::BackgroundWorker());
			this->btnShow = (gcnew System::Windows::Forms::Button());
			this->pictureBox1 = (gcnew System::Windows::Forms::PictureBox());
			(cli::safe_cast<System::ComponentModel::ISupportInitialize^  >(this->pictureBox1))->BeginInit();
			this->SuspendLayout();
			// 
			// backgroundWorker1
			// 
			this->backgroundWorker1->WorkerReportsProgress = true;
			this->backgroundWorker1->DoWork += gcnew System::ComponentModel::DoWorkEventHandler(this, &Form1::backgroundWorker1_DoWork);
			this->backgroundWorker1->ProgressChanged += gcnew System::ComponentModel::ProgressChangedEventHandler(this, &Form1::backgroundWorker1_ProgressChanged);
			// 
			// btnShow
			// 
			this->btnShow->Location = System::Drawing::Point(197, 227);
			this->btnShow->Name = L"btnShow";
			this->btnShow->Size = System::Drawing::Size(75, 23);
			this->btnShow->TabIndex = 0;
			this->btnShow->Text = L"Show";
			this->btnShow->UseVisualStyleBackColor = true;
			this->btnShow->Click += gcnew System::EventHandler(this, &Form1::btnShow_Click);
			// 
			// pictureBox1
			// 
			this->pictureBox1->Location = System::Drawing::Point(1, 2);
			this->pictureBox1->Name = L"pictureBox1";
			this->pictureBox1->Size = System::Drawing::Size(284, 215);
			this->pictureBox1->TabIndex = 1;
			this->pictureBox1->TabStop = false;
			// 
			// Form1
			// 
			this->AutoScaleDimensions = System::Drawing::SizeF(6, 13);
			this->AutoScaleMode = System::Windows::Forms::AutoScaleMode::Font;
			this->ClientSize = System::Drawing::Size(284, 262);
			this->Controls->Add(this->pictureBox1);
			this->Controls->Add(this->btnShow);
			this->DoubleBuffered = true;
			this->Name = L"Form1";
			this->Text = L"Display OpenCV frame";
			(cli::safe_cast<System::ComponentModel::ISupportInitialize^  >(this->pictureBox1))->EndInit();
			this->ResumeLayout(false);

		}
#pragma endregion
	private: System::Void backgroundWorker1_DoWork(System::Object^  sender, System::ComponentModel::DoWorkEventArgs^  e) {
				   BackgroundWorker^ worker = dynamic_cast<BackgroundWorker^>(sender);
				  capture = cvCreateCameraCapture(1);
				  while(1){
					if (camBusy) continue;
					frame = cvQueryFrame(capture);
					if(!frame) continue;
					worker->ReportProgress(1);	
				  }
				  cvReleaseImage(&frame);	
				  cvReleaseCapture(&capture); 
			 }

	private: System::Void btnShow_Click(System::Object^  sender, System::EventArgs^  e) {
				  camStatus = 1;
				 backgroundWorker1->RunWorkerAsync(10);
			 }

	private: System::Void DrawCvImage(IplImage *CvImage,System::Windows::Forms::PictureBox^ pbx) {     
		  // typecast IplImage to Bitmap
		  if ((pbx->Image == nullptr) || (pbx->Width != CvImage->width)||(pbx->Height != CvImage->height)){ 
  			pbx->Width = CvImage->width; 
  			pbx->Height = CvImage->height; 
  			Bitmap^ bmpPicBox = gcnew Bitmap(pbx->Width, pbx->Height); 
  			pbx->Image = bmpPicBox; 
		  }
 
		  Graphics^g = Graphics::FromImage(pbx->Image); 
 
		  Bitmap^ bmp = gcnew Bitmap(CvImage->width, CvImage->height, CvImage->widthStep, 
		  System::Drawing::Imaging::PixelFormat::Format24bppRgb, IntPtr(CvImage->imageData)); 
 
		  g->DrawImage(bmp, 0, 0, CvImage->width, CvImage->height);  
		  pbx->Refresh(); 
 
		  delete g; 
	}

	private: System::Void backgroundWorker1_ProgressChanged(System::Object^  sender, System::ComponentModel::ProgressChangedEventArgs^  e) {
				   if(!camBusy){
  				camBusy = 1;
  				 IplImage *destination = cvCreateImage(cvSize(640, 480),frame->depth,frame->nChannels);
  				 cvResize(frame, destination);			
  				 DrawCvImage(destination,pictureBox1);
  				 cvReleaseImage(&destination);
  				camBusy = 0;
			  }	
			 }
};

}


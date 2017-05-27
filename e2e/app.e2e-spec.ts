import { NgxFileDropPage } from './app.po';

describe('ngx-file-drop App', () => {
  let page: NgxFileDropPage;

  beforeEach(() => {
    page = new NgxFileDropPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('demo works!');
  });
});

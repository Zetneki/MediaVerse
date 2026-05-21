import { DomSanitizer } from '@angular/platform-browser';
import { SafeHtmlPipe } from './safe-html.pipe';

describe('SafeHtmlPipe', () => {
  describe('SafeHtmlPipe', () => {
    it('should create an instance', () => {
      const sanitizer = jasmine.createSpyObj<DomSanitizer>('DomSanitizer', [
        'bypassSecurityTrustHtml',
      ]);
      const pipe = new SafeHtmlPipe(sanitizer);
      expect(pipe).toBeTruthy();
    });
  });
});

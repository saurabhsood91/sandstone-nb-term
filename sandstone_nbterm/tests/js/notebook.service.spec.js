describe('NotebookService', function(){
  var nbService;
  var httpBackend;

  beforeEach(module('sandstone'));
  beforeEach(module('sandstone.editor'));
  beforeEach(module('sandstone.filesystemservice'));
  beforeEach(module('sandstone.templates'));
  beforeEach(module('sandstone.filetreedirective'));

  beforeEach(inject(function(NotebookService, $httpBackend){
    nbService = NotebookService;
    httpBackend = $httpBackend;

    httpBackend.whenPOST('/nbterm/a/kernel/execute').respond(function(method, url, data, headers, params){
      operation = JSON.parse(data).operation;
      if(operation == "START_KERNEL") {
        return [200, {'result': 'kernel started'}];
      } else if(operation == "SHUTDOWN_KERNEL") {
        return [200, {'result': 'kernel stopped'}];
      } else if(operation == "EXECUTE_CODE") {
        return [200, {res:['executed', {text: '[a.txt b.txt c.txt]'}]}]
      }
    });

    httpBackend.whenGET(/\/nbterm\/a\/notebook\?filepath=.*/).respond(function(){
      return [200, {cells: [{input: 'ls'}, {input: 'pwd'}, {input: 'ls -lrt'}]}];
    });

  }));

  describe('NotebookService tests', function(){
    it('should should initialize properly', function(){
      expect(nbService.cellsObj).toBeDefined();
      expect(nbService.getKernelStatus()).toBe('idle');
    });
    it('should start the kernel and set the kernel status to idle', function(){
      nbService.startKernel();
      httpBackend.flush();
      expect(nbService.getKernelStatus()).toBe('idle');
    });
    it('should stop the kernel and set the kernel status to stopped', function(){
      nbService.stopKernel();
      httpBackend.flush();
      expect(nbService.getKernelStatus()).toBe('stopped');
    });
    it('should execute a code cell', function(){
      var cell = {
        input: 'ls'
      };
      nbService.executeCodeCell(cell);
      httpBackend.flush();
      expect(cell.hasExecuted).toBeTruthy();
      expect(cell.running).not.toBeTruthy();
      expect(cell.output).toBe('[a.txt b.txt c.txt]');
    });
    it('should open a notebook', function(){
      var filepath = "/home/user/test.ipynb";
      nbService.openNotebook(filepath);
      httpBackend.flush();
      expect(nbService.cellsObj.cells.length).toBe(3);
    });
  });

});

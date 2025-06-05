import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CadastroNegociacaoComponent } from './cadastro-negociacao.component';
import { AuxiliarService } from 'src/app/services/auxiliar/auxiliar.service';
import { InstrumentoFinanceiroService } from 'src/app/services/instrumento-financeiro.service';
import { CotacaoService } from 'src/app/services/cotacao.service';
import { AtivoService } from 'src/app/services/ativo.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NegociacoesService } from 'src/app/services/negociacoes.service';
import { PessoaService } from 'src/app/services/pessoa.service';
import { FormBuilder } from '@angular/forms';
import { StorageFormService } from 'src/app/services/storage-form.service';
import { StorageService } from 'src/app/services/storage.service';
import { AtivoCorporativoService } from 'src/app/services/ativo-corporativo.service';
import { MatDialog } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { Produto } from 'src/app/models/produto.model';
import { Negociacao, StatusBoleto, InstrumentoFinanceiro } from 'src/app/models/negociacoes.model';
import { Ativo } from 'src/app/models/ativo.model';
import { Cotacao } from 'src/app/models/cotacao.model';
import { FormScreenComponent } from 'src/app/components/form/form-screen.component';

describe('CadastroNegociacaoComponent', () => {
  let component: CadastroNegociacaoComponent;
  let fixture: ComponentFixture<CadastroNegociacaoComponent>;
  let auxiliarServiceSpy: jasmine.SpyObj<AuxiliarService>;
  let instrumentoFinanceiroServiceSpy: jasmine.SpyObj<InstrumentoFinanceiroService>;
  let cotacaoServiceSpy: jasmine.SpyObj<CotacaoService>;
  let ativoServiceSpy: jasmine.SpyObj<AtivoService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let negociacoesServiceSpy: jasmine.SpyObj<NegociacoesService>;
  let pessoaServiceSpy: jasmine.SpyObj<PessoaService>;
  let storageFormServiceSpy: jasmine.SpyObj<StorageFormService>;
  let storageServiceSpy: jasmine.SpyObj<StorageService>;
  let ativoCorporativoServiceSpy: jasmine.SpyObj<AtivoCorporativoService>;
  let matDialogSpy: jasmine.SpyObj<MatDialog>;

  const mockProduto: Produto = {
    id: 1,
    nome: 'Teste Produto'
  };

  const mockAtivo: Ativo = {
    id: 1,
    ticker: 'TEST11',
    nome_ativo: 'Teste Ativo',
    emissor: {
      id: 1,
      id_bdc: 1,
      nome: 'Teste Emissor',
      cnpj: '12345678901234'
    }
  };

  const mockNegociacao: Negociacao = {
    id_negociacao: 1,
    instrumento_financeiro_id: 1,
    tipo_operacao: 1,
    id_modalidade: 1,
    status: StatusBoleto.PENDENTE_PREENCHIMENTO,
    nome_produto: 'Teste Produto',
    tipo_parametrizacao_id: 1,
    grupos: []
  };

  beforeEach(async () => {
    auxiliarServiceSpy = jasmine.createSpyObj('AuxiliarService', ['showToast', 'getParticipante', 'cnpjLimpar']);
    instrumentoFinanceiroServiceSpy = jasmine.createSpyObj('InstrumentoFinanceiroService', ['listarProdutos', 'listarCamposProduto']);
    cotacaoServiceSpy = jasmine.createSpyObj('CotacaoService', ['getCotacoesByFilter']);
    ativoServiceSpy = jasmine.createSpyObj('AtivoService', ['getAtivosByFilter']);
    routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl', 'getCurrentNavigation']);
    negociacoesServiceSpy = jasmine.createSpyObj('NegociacoesService', ['addBoleto', 'editBoleto', 'getMotivoBloqueioDesbloqueio', 'listarModalidadeProdutoTemplate']);
    pessoaServiceSpy = jasmine.createSpyObj('PessoaService', ['obterPessoas']);
    storageFormServiceSpy = jasmine.createSpyObj('StorageFormService', ['clearStorageFormFields']);
    storageServiceSpy = jasmine.createSpyObj('StorageService', ['setLocalStorage']);
    ativoCorporativoServiceSpy = jasmine.createSpyObj('AtivoCorporativoService', ['getAtivo', 'getAtivosByFilter', 'returnIsAtivoFJ4']);
    matDialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    await TestBed.configureTestingModule({
      declarations: [ CadastroNegociacaoComponent ],
      providers: [
        { provide: AuxiliarService, useValue: auxiliarServiceSpy },
        { provide: InstrumentoFinanceiroService, useValue: instrumentoFinanceiroServiceSpy },
        { provide: CotacaoService, useValue: cotacaoServiceSpy },
        { provide: AtivoService, useValue: ativoServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: NegociacoesService, useValue: negociacoesServiceSpy },
        { provide: PessoaService, useValue: pessoaServiceSpy },
        { provide: FormBuilder, useValue: new FormBuilder() },
        { provide: ActivatedRoute, useValue: { data: of({ pageTitle: 'Test Title' }) } },
        { provide: StorageFormService, useValue: storageFormServiceSpy },
        { provide: StorageService, useValue: storageServiceSpy },
        { provide: AtivoCorporativoService, useValue: ativoCorporativoServiceSpy },
        { provide: MatDialog, useValue: matDialogSpy }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CadastroNegociacaoComponent);
    component = fixture.componentInstance;
    
    // Setup default spy returns
    instrumentoFinanceiroServiceSpy.listarProdutos.and.returnValue(of({ data: [mockProduto] }));
    auxiliarServiceSpy.getParticipante.and.returnValue({ idEq3: 1, cetip: '123' });
    routerSpy.getCurrentNavigation.and.returnValue({ extras: { state: {} } } as any);
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.isLoading).toBeTruthy();
    expect(component.showCotacoes).toBeFalsy();
    expect(component.hiddenButtonSave).toBeTruthy();
    expect(component.hiddenButtonRequestApproval).toBeTruthy();
  });

  it('should load produtos on init', () => {
    component.ngOnInit();
    expect(instrumentoFinanceiroServiceSpy.listarProdutos).toHaveBeenCalled();
    expect(component.produtos).toEqual([mockProduto]);
  });

  it('should handle produto change', () => {
    const event = { value: mockProduto };
    component.produtoChange(event);
    expect(component.produto).toEqual(mockProduto);
    expect(component.isProduto).toBeFalsy();
    expect(component.tipoOperacao).toBe(0);
    expect(component.modalidade).toBe(0);
    expect(storageServiceSpy.setLocalStorage).toHaveBeenCalled();
  });

  it('should handle save boleto success', () => {
    const mockResponse = { data: { id_negociacao: 1 } };
    negociacoesServiceSpy.addBoleto.and.returnValue(of(mockResponse));
    
    component.negociacao = mockNegociacao;
    component.formCadastroBoleto = {
      getValueWithComponent: () => ({ valid: true }),
      form: { valid: true }
    } as any;

    component.saveBoleto();
    expect(negociacoesServiceSpy.addBoleto).toHaveBeenCalled();
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/lista-boleto');
  });

  it('should handle save boleto error', () => {
    const mockError = { message: 'Error message' };
    negociacoesServiceSpy.addBoleto.and.returnValue(throwError(mockError));
    
    component.negociacao = mockNegociacao;
    component.formCadastroBoleto = {
      getValueWithComponent: () => ({ valid: true }),
      form: { valid: true }
    } as any;

    component.saveBoleto();
    expect(auxiliarServiceSpy.showToast).toHaveBeenCalledWith(mockError);
  });

  it('should handle search ativo by ticker', () => {
    const mockResponse = { data: [mockAtivo] };
    ativoServiceSpy.getAtivosByFilter.and.returnValue(of(mockResponse));
    
    component.produto = mockProduto;
    component.searchAtivoByTicker('TEST11');
    
    expect(ativoServiceSpy.getAtivosByFilter).toHaveBeenCalled();
    expect(component.ativosByTicker).toEqual([mockAtivo]);
  });

  it('should handle load form', async () => {
    const mockTemplate = {
      id: 1,
      id_template: 1,
      nome: 'Test Template',
      versao: 1,
      grupos: []
    };

    instrumentoFinanceiroServiceSpy.listarCamposProduto.and.returnValue(of({ data: [mockTemplate] }));
    pessoaServiceSpy.obterPessoas.and.returnValue(of({ data: [{ id: 1 }] }));

    component.produto = mockProduto;
    component.ativoSelected = mockAtivo;
    component.formCadastroBoleto = {
      createDynamicForm: jasmine.createSpy('createDynamicForm'),
      form: { get: () => ({ valueChanges: of('') }) }
    } as any;

    await component.loadForm(mockAtivo);

    expect(instrumentoFinanceiroServiceSpy.listarCamposProduto).toHaveBeenCalled();
    expect(pessoaServiceSpy.obterPessoas).toHaveBeenCalled();
    expect(component.formCadastroBoleto.createDynamicForm).toHaveBeenCalled();
  });

  it('should handle setup edit mode', async () => {
    const mockAtivoResponse = { data: [mockAtivo] };
    ativoCorporativoServiceSpy.getAtivo.and.returnValue(of(mockAtivoResponse));
    
    component.negociacao = mockNegociacao;
    component.produtos = [mockProduto];
    component.formCadastroBoleto = {
      createDynamicForm: jasmine.createSpy('createDynamicForm'),
      form: { get: () => ({ valueChanges: of('') }) }
    } as any;

    await component.setupEditMode();

    expect(ativoCorporativoServiceSpy.getAtivo).toHaveBeenCalled();
    expect(component.produto).toEqual(mockProduto);
    expect(component.tipoOperacao).toBe(mockNegociacao.tipo_operacao);
    expect(component.modalidade).toBe(mockNegociacao.id_modalidade);
  });

  it('should handle setup new boleto', () => {
    component.produtos = [mockProduto];
    component.ativoSelected = mockAtivo;
    component.formCadastroBoleto = {
      createDynamicForm: jasmine.createSpy('createDynamicForm'),
      form: { get: () => ({ valueChanges: of('') }) }
    } as any;

    component.setupNewBoleto();

    expect(component.produto).toEqual(mockProduto);
    expect(component.tipoOperacao).toBe(1);
    expect(component.modalidade).toBe(1);
  });

  it('should verify modalidade definitiva', () => {
    component.negociacao = { ...mockNegociacao, tipo_parametrizacao_id: 1 };
    component.idModalidadeSelecionada = 1;
    
    expect(component.verificarModalidadeDefinitiva()).toBeTruthy();
  });

  it('should verify modalidade gerencial', () => {
    component.negociacao = { ...mockNegociacao, tipo_parametrizacao_id: 2 };
    component.idModalidadeSelecionada = 2;
    
    expect(component.verificarModalidadeGerencial()).toBeTruthy();
  });

  it('should verify modalidade mercado', () => {
    component.negociacao = { ...mockNegociacao, tipo_parametrizacao_id: 3 };
    component.idModalidadeSelecionada = 3;
    
    expect(component.verificarModalidadeMercado()).toBeTruthy();
  });

  it('should verify modalidade deposito', () => {
    component.negociacao = { ...mockNegociacao, tipo_parametrizacao_id: 4 };
    component.idModalidadeSelecionada = 4;
    
    expect(component.verificarModalidadeDeposito()).toBeTruthy();
  });

  it('should handle set status for mercado', () => {
    component.negociacao = { ...mockNegociacao, tipo_parametrizacao_id: 3 };
    component.idModalidadeSelecionada = 3;
    
    expect(component.setStatus()).toBe(StatusBoleto.CONFIRMADO);
  });

  it('should handle set status for other modalidades', () => {
    component.negociacao = { ...mockNegociacao, tipo_parametrizacao_id: 1 };
    component.idModalidadeSelecionada = 1;
    
    expect(component.setStatus()).toBe(StatusBoleto.PENDENTE_APROVACAO);
  });

  it('should handle save boleto em preenchimento for definitiva', () => {
    component.negociacao = { ...mockNegociacao, tipo_parametrizacao_id: 1 };
    component.idModalidadeSelecionada = 1;
    spyOn(component, 'saveBoleto');
    
    component.saveBoletoEmPreenchimento();
    
    expect(component.saveBoleto).toHaveBeenCalledWith(StatusBoleto.PENDENTE_PREENCHIMENTO, false);
  });

  it('should handle save boleto em preenchimento for mercado', () => {
    component.negociacao = { ...mockNegociacao, tipo_parametrizacao_id: 3 };
    component.idModalidadeSelecionada = 3;
    spyOn(component, 'saveBoleto');
    
    component.saveBoletoEmPreenchimento();
    
    expect(component.saveBoleto).toHaveBeenCalledWith(StatusBoleto.CONFIRMADO);
  });

  it('should handle load modalidades', () => {
    const mockModalidades = [{ id_modalidade: 1, nome_modalidade: 'Test' }];
    negociacoesServiceSpy.listarModalidadeProdutoTemplate.and.returnValue(of({ data: mockModalidades }));
    
    component.loadModalidades();
    
    expect(negociacoesServiceSpy.listarModalidadeProdutoTemplate).toHaveBeenCalled();
    expect(component.modalidades).toEqual(mockModalidades);
  });

  it('should handle monta combo modalidades', () => {
    component.modalidades = [
      { id_modalidade: 1, nome_modalidade: 'Test 1' },
      { id_modalidade: 1, nome_modalidade: 'Test 2' },
      { id_modalidade: 2, nome_modalidade: 'Test 3' }
    ];
    
    component.montaComboModalidades();
    
    expect(component.modalidadesCombo.length).toBe(2);
    expect(component.modalidadesCombo[0].id_modalidade).toBe(1);
    expect(component.modalidadesCombo[1].id_modalidade).toBe(2);
  });

  it('should handle check disabled event field', () => {
    component.modalidade = 0;
    expect(component.checkDisabledEventField()).toBeTruthy();
    
    component.modalidade = 1;
    expect(component.checkDisabledEventField()).toBeFalsy();
    
    component.modalidade = 4; // DEPOSITO
    expect(component.checkDisabledEventField()).toBeTruthy();
    
    component.isEdit = true;
    expect(component.checkDisabledEventField()).toBeTruthy();
  });

  it('should handle set conta broker', () => {
    component.setContaBroker(true);
    expect(component.isContaBroker).toBeTruthy();
    
    component.setContaBroker(false);
    expect(component.isContaBroker).toBeFalsy();
  });

  it('should handle set value conta broker', () => {
    component.isContaBroker = true;
    component.contaBroker = { idEq3: 1, cetip: '123' };
    component.negociacao = {
      ...mockNegociacao,
      grupos: [{
        nome: 'liquidacao',
        parametros: [
          { nome: 'id_intermediador', valor: '' },
          { nome: 'intermediador_conta_broker', valor: '' }
        ]
      }]
    };
    
    component.setValueContaBroker();
    
    expect(component.negociacao.grupos[0].parametros[0].valor).toBe('1');
    expect(component.negociacao.grupos[0].parametros[1].valor).toBe('123');
  });

  it('should handle change form control', () => {
    const mockFormControl = { setValue: jasmine.createSpy('setValue') };
    component.formCadastroBoleto = {
      form: { get: () => mockFormControl }
    } as any;
    
    component.changeFormControl('test', 'value');
    
    expect(mockFormControl.setValue).toHaveBeenCalledWith('value');
  });

  it('should handle remove field by template', () => {
    component.template = {
      grupos: [{
        nome: 'test',
        parametros: [
          { nome: 'field1' },
          { nome: 'field2' }
        ]
      }]
    };
    
    component.removeFieldByTemplate('field1', 'test');
    
    expect(component.template.grupos[0].parametros.length).toBe(1);
    expect(component.template.grupos[0].parametros[0].nome).toBe('field2');
  });

  it('should handle bdc changed', () => {
    const mockData = {
      field: { name: 'alocacao_final_do_risco_de_credito' },
      source: { id: 1 }
    };
    
    component.bdcChanged(mockData);
    
    expect(component.dataRiscoFinal).toEqual(mockData.source);
  });

  it('should handle parte changed', () => {
    const mockEvent = {
      source: {
        documento: '12345678901234'
      }
    };
    
    component.verificarModalidadeDefinitiva = () => true;
    component.settingsTaruma = { cnpjParte: '12345678901234' };
    
    component.parteChanged(mockEvent);
    
    expect(component.preSettings).toEqual(component.settingsTaruma);
  });

  it('should handle trade owner changed', () => {
    const mockEvent = { id_colaborador: 1 };
    const mockFormControl = { setValue: jasmine.createSpy('setValue') };
    
    component.formCadastroBoleto = {
      form: { get: () => mockFormControl }
    } as any;
    
    component.tradeOwnerChanged(mockEvent);
    
    expect(mockFormControl.setValue).toHaveBeenCalledWith(1);
  });

  it('should handle show dialog error', () => {
    const mockErrorMessage = 'Test error';
    const mockDialogRef = {
      afterClosed: () => of({ action: 'saveRascunho' })
    };
    
    matDialogSpy.open.and.returnValue(mockDialogRef as any);
    spyOn(component, 'saveBoletoEmPreenchimento');
    
    component.showDialogError(mockErrorMessage);
    
    expect(matDialogSpy.open).toHaveBeenCalled();
    expect(component.saveBoletoEmPreenchimento).toHaveBeenCalled();
  });

  it('should handle reset SPPI desconsiderado', () => {
    const mockFormValue = {
      sppi_desconsiderado: true
    };
    
    component.formCadastroBoleto = {
      getValueWithComponent: () => mockFormValue
    } as any;
    
    spyOn(component, 'changeFormControl');
    
    component.resetSPPIDesconsiderado();
    
    expect(component.changeFormControl).toHaveBeenCalledWith('sppi_desconsiderado', false);
    expect(component.negociacao.motivo_observacao).toBe('');
  });
}); 
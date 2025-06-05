// Adiciona a URL base da API no topo do arquivo
const API_URL = 'https://projeto-jgs-coleta-git-main-ghrenriques-projects.vercel.app';

$(document).ready(function() {
    // Função para mostrar feedback no modal
    function showFeedback(message, title = 'Feedback', callback = null) {
        $('#feedbackModalLabel').text(title);
        $('#feedbackMessage').text(message);
        
        // Define o ícone baseado no título
        let iconClass = 'fas fa-info-circle';
        if (title === 'Sucesso') {
            iconClass = 'fas fa-check-circle text-success';
        } else if (title === 'Erro') {
            iconClass = 'fas fa-exclamation-circle text-danger';
        } else if (title === 'Atenção') {
            iconClass = 'fas fa-exclamation-triangle text-warning';
        }
        
        $('#feedbackModal .modal-body i').removeClass().addClass(iconClass + ' fa-3x');
        
        const modal = new bootstrap.Modal(document.getElementById('feedbackModal'));
        
        // Remove event listener anterior se existir
        $('#feedbackModal').off('hidden.bs.modal');
        
        // Adiciona novo event listener se houver callback
        if (callback) {
            $('#feedbackModal').on('hidden.bs.modal', callback);
        }
        
        modal.show();
    }

    // Função para mostrar confirmação
    function showConfirm(message, onConfirm) {
        $('#confirmMessage').text(message);
        const modal = new bootstrap.Modal(document.getElementById('confirmModal'));
        
        // Remove event listener anterior se existir
        $('#confirmButton').off('click');
        
        // Adiciona novo event listener
        $('#confirmButton').on('click', function() {
            modal.hide();
            onConfirm();
        });
        
        modal.show();
    }

    // Controle de loading para GET (lista) e POST/PUT/DELETE (ações)
    let loadingStartTime = null;
    function showLoading(minTime = 0) {
        loadingStartTime = Date.now();
        if ($('#loadingOverlay').length === 0) {
            $('body').append('<div id="loadingOverlay" style="position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(255,255,255,0.7);z-index:9999;display:flex;align-items:center;justify-content:center;"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Carregando...</span></div></div>');
        } else {
            $('#loadingOverlay').show();
        }
    }
    function hideLoading(minTime = 0, callback) {
        const elapsed = Date.now() - loadingStartTime;
        const wait = Math.max(minTime - elapsed, 0);
        setTimeout(function() {
            $('#loadingOverlay').fadeOut(200, function() {
                if (typeof callback === 'function') callback();
            });
        }, wait);
    }

    // Intercepta todas as requisições AJAX para mostrar o loading
    $(document).ajaxSend(function(event, jqXHR, settings) {
        // Só ativa loading para POST/PUT/DELETE ou GET em páginas específicas
        if (settings.type === 'GET') {
            // Não mostra loading para GET na página inicial
            if (!window.location.pathname.includes('index.html')) {
                showLoading(300);
            }
        } else {
            // Reduz o tempo mínimo de loading para operações de escrita
            showLoading(500);
        }
    });

    // Intercepta erros AJAX para garantir que o loading seja removido
    $(document).ajaxError(function(event, jqXHR, settings, error) {
        hideLoading(0);
    });

    // Função para carregar a lista de clientes
    function loadClientes() {
        $.ajax({
            url: API_URL + '/clientes',
            type: 'GET',
            success: function(clientes) {
                const tbody = $('#clientesList');
                tbody.empty();
                clientes.forEach(function(cliente) {
                    const row = `
                        <tr>
                            <td>${cliente.id}</td>
                            <td>${cliente.nome}</td>
                            <td>
                                <div class="btn-group" role="group">
                                    <button class="btn btn-sm btn-primary btn-editar" data-id="${cliente.id}" data-nome="${cliente.nome}">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn btn-sm btn-danger btn-excluir" data-id="${cliente.id}" data-nome="${cliente.nome}">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `;
                    tbody.append(row);
                });
                hideLoading(300);
            },
            error: function(xhr, status, error) {
                hideLoading(300, function() {
                    showFeedback('Erro ao carregar clientes: ' + error, 'Erro');
                });
            }
        });
    }

    // Initialize Select2 for better dropdown experience
    if ($('#cliente').length) {
        $('#cliente').select2({
            placeholder: 'Selecione um cliente',
            width: '100%'
        });
    }

    // Load clients and set next protocol number
    if ($('#cliente').length) {
        $.ajax({
            url: API_URL + '/clientes',
            type: 'GET',
            success: function(clientes) {
                const clienteSelect = $('#cliente');
                clientes.forEach(function(cliente) {
                    clienteSelect.append(new Option(cliente.nome, cliente.id));
                });
            },
            error: function(xhr, status, error) {
                showFeedback('Erro ao carregar clientes: ' + error, 'Erro');
            }
        });
    }

    // Get next protocol number
    if ($('#numeroProtocolo').length) {
        $.ajax({
            url: API_URL + '/config',
            type: 'GET',
            success: function(config) {
                const nextProtocol = config.ultimoProtocolo + 1;
                $('#numeroProtocolo').val(nextProtocol);
            },
            error: function(xhr, status, error) {
                showFeedback('Erro ao carregar número do protocolo: ' + error, 'Erro');
            }
        });
    }

    // Função para verificar se todos os campos obrigatórios estão preenchidos
    function checkFormValidity() {
        const requiredFields = [
            '#numeroProtocolo',
            '#data',
            '#notasFiscais',
            '#cliente',
            '#nomeCompleto',
            '#rg',
            '#placa',
            '#notaFiscal',
            '#certificadoAnalise',
            '#loteAmostra',
            '#boletoAnexo'
        ];

        const allFieldsValid = requiredFields.every(field => {
            const element = $(field);
            if (element.is(':checkbox')) {
                return element.is(':checked');
            }
            return element.val() && element.val().trim() !== '';
        });

        // Atualiza o estado do botão de impressão
        $('#btnImprimir').prop('disabled', !allFieldsValid);
        
        return allFieldsValid;
    }

    // Adiciona listeners para todos os campos do formulário
    if ($('#protocoloForm').length) {
        const formFields = '#numeroProtocolo, #data, #notasFiscais, #cliente, #nomeCompleto, #rg, #placa, #notaFiscal, #certificadoAnalise, #loteAmostra, #boletoAnexo';
        
        // Inicialmente desabilita o botão de impressão
        $('#btnImprimir').prop('disabled', true);
        
        // Adiciona listeners para todos os campos
        $(formFields).on('input change', function() {
            checkFormValidity();
        });

        // Form submission (protocolo)
        $('#protocoloForm').on('submit', function(e) {
            e.preventDefault();
            
            if (!checkFormValidity()) {
                showFeedback('Por favor, preencha todos os campos obrigatórios.', 'Atenção');
                return;
            }
            
            const formData = {
                data: $('#data').val(),
                notasFiscais: $('#notasFiscais').val(),
                clienteId: $('#cliente').val(),
                nomeCompleto: $('#nomeCompleto').val(),
                rg: $('#rg').val(),
                placa: $('#placa').val(),
                notaFiscal: $('#notaFiscal').is(':checked'),
                certificadoAnalise: $('#certificadoAnalise').is(':checked'),
                loteAmostra: $('#loteAmostra').is(':checked'),
                boletoAnexo: $('#boletoAnexo').is(':checked')
            };

            showConfirm('Tem certeza que deseja salvar este protocolo?', function() {
                $.ajax({
                    url: API_URL + '/protocolos',
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(formData),
                    success: function(response) {
                        hideLoading(500, function() {
                            showFeedback('Protocolo salvo com sucesso!', 'Sucesso', function() {
                                window.location.href = 'lista.html';
                            });
                        });
                    },
                    error: function(xhr, status, error) {
                        hideLoading(0, function() {
                            showFeedback('Erro ao salvar o protocolo: ' + error, 'Erro');
                        });
                    }
                });
            });
        });
    }

    // Print functionality
    if ($('#btnImprimir').length) {
        $('#btnImprimir').on('click', function() {
            if (!checkFormValidity()) {
                showFeedback('Por favor, preencha todos os campos obrigatórios antes de imprimir.', 'Atenção');
                return;
            }
            
            showConfirm('Deseja imprimir o protocolo?', function() {
                window.print();
            });
        });
    }

    // Format RG input
    if ($('#rg').length) {
        $('#rg').on('input', function() {
            let value = $(this).val().replace(/\D/g, '');
            if (value.length > 9) value = value.substr(0, 9);
            value = value.replace(/(\d{2})(\d{3})(\d{3})(\d{1})$/, '$1.$2.$3-$4');
            $(this).val(value);
        });
    }

    // Format placa input
    if ($('#placa').length) {
        $('#placa').on('input', function() {
            let value = $(this).val().toUpperCase();
            value = value.replace(/[^A-Z0-9]/g, '');
            if (value.length > 7) value = value.substr(0, 7);
            if (value.length > 3) {
                value = value.substr(0, 3) + '-' + value.substr(3);
            }
            $(this).val(value);
        });
    }

    // Auto-fill nome when selecting client
    if ($('#cliente').length) {
        $('#cliente').on('change', function() {
            const clienteId = $(this).val();
            if (clienteId) {
                $.ajax({
                    url: API_URL + '/clientes/' + clienteId,
                    type: 'GET',
                    success: function(cliente) {
                        $('#nomeCompleto').val(cliente.nome);
                    },
                    error: function(xhr, status, error) {
                        showFeedback('Erro ao carregar dados do cliente: ' + error, 'Erro');
                    }
                });
            }
        });
    }

    // Cliente form submission
    if ($('#formCliente').length) {
        $('#formCliente').on('submit', function(e) {
            e.preventDefault();
            
            const nome = $('#nome').val().trim();
            
            if (!nome) {
                showFeedback('Por favor, preencha o nome do cliente.', 'Atenção');
                return;
            }
            
            showConfirm('Tem certeza que deseja cadastrar este cliente?', function() {
                $.ajax({
                    url: API_URL + '/clientes',
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify({ nome }),
                    success: function(cliente) {
                        hideLoading(2300, function() {
                            showFeedback('Cliente cadastrado com sucesso!', 'Sucesso', function() {
                                window.location.href = 'lista-clientes.html';
                            });
                            $('#nome').val(''); // Limpar formulário
                        });
                    },
                    error: function(xhr, status, error) {
                        hideLoading(2300, function() {
                            showFeedback('Erro ao cadastrar cliente: ' + error, 'Erro');
                        });
                    }
                });
            });
        });
    }

    // Lista de Clientes - Carregar lista
    if ($('#clientesList').length) {
        loadClientes();
    }

    // Lista de Clientes - Excluir cliente
    $(document).on('click', '.btn-excluir', function() {
        const id = $(this).data('id');
        const nome = $(this).data('nome');
        
        showConfirm(`Tem certeza que deseja excluir o cliente "${nome}"?`, function() {
            $.ajax({
                url: API_URL + '/clientes/' + id,
                type: 'DELETE',
                success: function() {
                    hideLoading(2300, function() {
                        showFeedback('Cliente excluído com sucesso!', 'Sucesso', function() {
                            loadClientes();
                        });
                    });
                },
                error: function(xhr, status, error) {
                    hideLoading(2300, function() {
                        showFeedback('Erro ao excluir cliente: ' + error, 'Erro');
                    });
                }
            });
        });
    });

    // Lista de Clientes - Editar cliente
    $(document).on('click', '.btn-editar', function() {
        const id = $(this).data('id');
        const nome = $(this).data('nome');
        
        $('#editId').val(id);
        $('#editNome').val(nome);
        
        const modal = new bootstrap.Modal(document.getElementById('editModal'));
        modal.show();
    });

    // Lista de Clientes - Salvar edição
    $('#saveEditButton').on('click', function() {
        const id = $('#editId').val();
        const nome = $('#editNome').val().trim();
        
        if (!nome) {
            showFeedback('Por favor, preencha o nome do cliente.', 'Atenção');
            return;
        }
        
        showConfirm(`Tem certeza que deseja atualizar o cliente "${nome}"?`, function() {
            $.ajax({
                url: API_URL + '/clientes/' + id,
                type: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify({ nome: nome }),
                success: function() {
                    hideLoading(2300, function() {
                        showFeedback('Cliente atualizado com sucesso!', 'Sucesso', function() {
                            const modal = bootstrap.Modal.getInstance(document.getElementById('editModal'));
                            modal.hide();
                            loadClientes();
                        });
                    });
                },
                error: function(xhr, status, error) {
                    hideLoading(2300, function() {
                        showFeedback('Erro ao atualizar cliente: ' + error, 'Erro');
                    });
                }
            });
        });
    });

    // Check if we're on the index page and have an ID parameter
    if (window.location.pathname.includes('index.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        const protocolId = urlParams.get('id');
        
        if (protocolId) {
            // Load protocol data
            $.ajax({
                url: API_URL + '/protocolos/' + protocolId,
                type: 'GET',
                success: function(protocolo) {
                    // Fill form fields with protocol data
                    $('#numeroProtocolo').val(protocolo.numeroProtocolo);
                    $('#data').val(protocolo.data);
                    $('#notasFiscais').val(protocolo.notasFiscais);
                    $('#cliente').val(protocolo.clienteId).trigger('change');
                    $('#nomeCompleto').val(protocolo.nomeCompleto);
                    $('#rg').val(protocolo.rg);
                    $('#placa').val(protocolo.placa);
                    $('#notaFiscal').prop('checked', protocolo.notaFiscal);
                    $('#certificadoAnalise').prop('checked', protocolo.certificadoAnalise);
                    $('#loteAmostra').prop('checked', protocolo.loteAmostra);
                    $('#boletoAnexo').prop('checked', protocolo.boletoAnexo);
                    
                    // Disable all form fields for printing
                    $('#protocoloForm input, #protocoloForm select').prop('disabled', true);
                },
                error: function(xhr, status, error) {
                    showFeedback('Erro ao carregar protocolo: ' + error, 'Erro');
                }
            });
        }
    }
}); 
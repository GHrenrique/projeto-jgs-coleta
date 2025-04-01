$(document).ready(function() {
    // Initialize Select2 for better dropdown experience
    $('#cliente').select2({
        placeholder: 'Selecione um cliente',
        width: '100%'
    });

    // Load clients and set next protocol number
    $.ajax({
        url: 'http://localhost:3000/clientes',
        type: 'GET',
        success: function(clientes) {
            const clienteSelect = $('#cliente');
            clientes.forEach(function(cliente) {
                clienteSelect.append(new Option(cliente.nome, cliente.id));
            });
        },
        error: function(xhr, status, error) {
            alert('Erro ao carregar clientes: ' + error);
        }
    });

    // Get next protocol number
    $.ajax({
        url: 'http://localhost:3000/config',
        type: 'GET',
        success: function(config) {
            const nextProtocol = config.ultimoProtocolo + 1;
            $('#numeroProtocolo').val(nextProtocol);
        },
        error: function(xhr, status, error) {
            alert('Erro ao carregar número do protocolo: ' + error);
        }
    });

    // Form submission
    $('#protocoloForm').on('submit', function(e) {
        e.preventDefault();
        
        const formData = {
            numeroProtocolo: $('#numeroProtocolo').val(),
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

        // Update protocol number in config
        $.ajax({
            url: 'http://localhost:3000/config',
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify({
                ultimoProtocolo: parseInt(formData.numeroProtocolo)
            }),
            success: function() {
                // Save protocol after updating config
                $.ajax({
                    url: 'http://localhost:3000/protocolos',
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(formData),
                    success: function(response) {
                        alert('Protocolo salvo com sucesso!');
                        window.location.href = 'lista.html';
                    },
                    error: function(xhr, status, error) {
                        alert('Erro ao salvar o protocolo: ' + error);
                    }
                });
            },
            error: function(xhr, status, error) {
                alert('Erro ao atualizar número do protocolo: ' + error);
            }
        });
    });

    // Print functionality
    $('#btnImprimir').on('click', function() {
        window.print();
    });

    // Format RG input
    $('#rg').on('input', function() {
        let value = $(this).val().replace(/\D/g, '');
        if (value.length > 9) value = value.substr(0, 9);
        value = value.replace(/(\d{2})(\d{3})(\d{3})(\d{1})$/, '$1.$2.$3-$4');
        $(this).val(value);
    });

    // Format placa input
    $('#placa').on('input', function() {
        let value = $(this).val().toUpperCase();
        value = value.replace(/[^A-Z0-9]/g, '');
        if (value.length > 7) value = value.substr(0, 7);
        if (value.length > 3) {
            value = value.substr(0, 3) + '-' + value.substr(3);
        }
        $(this).val(value);
    });

    // Auto-fill nome when selecting client
    $('#cliente').on('change', function() {
        const clienteId = $(this).val();
        if (clienteId) {
            $.ajax({
                url: `http://localhost:3000/clientes/${clienteId}`,
                type: 'GET',
                success: function(cliente) {
                    $('#nomeCompleto').val(cliente.nome);
                }
            });
        }
    });
}); 